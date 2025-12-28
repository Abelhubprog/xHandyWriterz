/**
 * InAppEmail Component - Send emails with file attachments to admin
 * 
 * Features:
 * - Rich email composition
 * - File attachments (up to 10 files)
 * - Sends via Mattermost for unified communication
 * - Email notifications to admin
 * - Real-time delivery status
 */

import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  Mail,
  Send,
  Paperclip,
  X,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  MessageSquare,
  User
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { mattermostClient, type MattermostFileInfo } from '@/lib/mm-client';
import useMMAuth from '@/hooks/mattermost/useMMAuth';
import { resolveApiUrl } from '@/lib/api-base';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface InAppEmailProps {
  defaultSubject?: string;
  defaultMessage?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const InAppEmail: React.FC<InAppEmailProps> = ({
  defaultSubject = '',
  defaultMessage = '',
  onSuccess,
  onCancel
}) => {
  const { user } = useUser();
  const { status: mmStatus, user: mmUser } = useMMAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [to] = useState('support@handywriterz.com'); // Fixed admin email
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`You can only attach up to ${MAX_FILES} files`);
      return;
    }

    const invalidFiles = newFiles.filter(f => f.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      toast.error(`Some files exceed 100MB: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} file(s)`);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getAdminSupportChannel = async (): Promise<string> => {
    try {
      // Get all channels
      const channels = await mattermostClient.listChannels();
      
      // Look for existing support/admin channel
      const supportChannel = channels.find(
        c => c.name.includes('support') || c.name.includes('admin') || c.type === 'P'
      );

      if (supportChannel) {
        return supportChannel.id;
      }

      // If no support channel exists, create one
      const teams = await mattermostClient.listTeams();
      const defaultTeam = teams[0];

      if (!defaultTeam) {
        throw new Error('No Mattermost team available');
      }

      const channelName = `support-${user?.id?.slice(0, 8) || 'user'}-${Date.now()}`;
      const response = await fetch(`${mattermostClient.apiBaseUrl}/channels`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          team_id: defaultTeam.id,
          name: channelName,
          display_name: `Support - ${user?.firstName || 'User'}`,
          type: 'P',
          purpose: 'Customer support channel'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create support channel');
      }

      const channel = await response.json();
      return channel.id;
    } catch (error) {
      console.error('Error getting support channel:', error);
      throw new Error('Failed to access support channel');
    }
  };

  const uploadFiles = async (channelId: string): Promise<MattermostFileInfo[]> => {
    if (files.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: MattermostFileInfo[] = [];
      const chunkSize = 3;

      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const chunkResults = await mattermostClient.uploadFiles(channelId, chunk);
        uploadedFiles.push(...chunkResults);
        
        setUploadProgress(Math.round(((i + chunk.length) / files.length) * 100));
      }

      setUploadProgress(100);
      return uploadedFiles;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (mmStatus !== 'ready') {
      toast.error('Please wait for Mattermost connection');
      return;
    }

    setIsSending(true);

    try {
      // Get or create support channel
      toast.loading('Preparing email...', { id: 'email-send' });
      const channelId = await getAdminSupportChannel();

      // Upload files if any
      let uploadedFiles: MattermostFileInfo[] = [];
      if (files.length > 0) {
        toast.loading('Uploading attachments...', { id: 'email-send' });
        uploadedFiles = await uploadFiles(channelId);
      }

      // Compose email message in Mattermost format
      const emailContent = `
📧 **Email from ${user?.firstName || ''} ${user?.lastName || ''}**

**From:** ${user?.primaryEmailAddress?.emailAddress || 'Unknown'}
**To:** ${to}
**Subject:** ${subject}

---

${message}

${uploadedFiles.length > 0 ? `\n**Attachments:** ${uploadedFiles.length} file(s)\n${uploadedFiles.map(f => `• ${f.name} (${formatFileSize(f.size)})`).join('\n')}` : ''}

---
*Sent via in-app email at ${new Date().toLocaleString()}*
      `.trim();

      // Send as Mattermost post
      toast.loading('Sending email...', { id: 'email-send' });
      await mattermostClient.createPost({
        channelId,
        message: emailContent,
        fileIds: uploadedFiles.map(f => f.id)
      });

      // Mark channel as viewed
      await mattermostClient.markChannelViewed(channelId);

      // Success!
      setEmailSent(true);
      toast.success('Email sent successfully!', { id: 'email-send' });

      // Optional: Send actual email notification to admin (backend integration needed)
      // This would typically call a backend API to send the actual email
      try {
        await fetch(resolveApiUrl('/api/notify-admin-email'), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            from: user?.primaryEmailAddress?.emailAddress,
            subject,
            message,
            channelId,
            fileCount: uploadedFiles.length
          })
        }).catch(() => {}); // Silent fail - main communication is through Mattermost
      } catch (e) {
        // Ignore email notification errors
      }

      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('Email send error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to send email',
        { id: 'email-send' }
      );
    } finally {
      setIsSending(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your message has been delivered to our support team. We'll get back to you shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setEmailSent(false);
                setSubject('');
                setMessage('');
                setFiles([]);
              }}
            >
              Send Another Email
            </Button>
            <Button onClick={onSuccess}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Go to Messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Send Email to Admin</h2>
              <p className="text-purple-100 text-sm">Quick and secure communication</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-5">
          {/* From Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              From
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || 'Not available'}
            </div>
          </div>

          {/* To Field (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
              {to}
              <Badge variant="secondary" className="ml-2">Admin Support</Badge>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="w-full"
              required
              disabled={isSending}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full min-h-[200px]"
              rows={8}
              required
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Be as detailed as possible to help us assist you better
            </p>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Paperclip className="inline w-4 h-4 mr-2" />
              Attachments (Optional)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
                disabled={files.length >= MAX_FILES || isSending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={files.length >= MAX_FILES || isSending}
                className="mb-1"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach Files
              </Button>
              <p className="text-xs text-gray-500">
                Up to {MAX_FILES} files • Max 100MB each • {files.length}/{MAX_FILES} attached
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isSending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Uploading attachments...</span>
                  <span className="text-purple-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auth Warning */}
          {mmStatus !== 'ready' && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Please wait for Mattermost connection. Navigate to Messages to connect.
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert>
            <MessageSquare className="w-4 h-4" />
            <AlertDescription>
              <strong>Quick Response:</strong> Your email will be sent via our messaging system for faster response times. 
              You'll be able to continue the conversation in real-time.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || mmStatus !== 'ready'}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InAppEmail;
