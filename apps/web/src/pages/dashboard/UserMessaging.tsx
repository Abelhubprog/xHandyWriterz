/**
 * UserMessaging - User-side messaging with file sharing
 * 
 * Features:
 * - Chat with support team
 * - Upload and share files
 * - Track message history
 * - File attachment preview
 * - Real-time message updates
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Paperclip, Send, Loader2, X,
  AlertCircle, CheckCircle, Download, FileText, Image as ImageIcon,
  Info, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import {
  mattermostClient,
  type MattermostPost,
  type MattermostFileInfo
} from '@/lib/mm-client';
import useMMAuth from '@/hooks/mattermost/useMMAuth';
import useMattermostChannels from '@/hooks/mattermost/useMattermostChannels';
import useMattermostTimeline from '@/hooks/mattermost/useMattermostTimeline';
import { env } from '@/env';

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes)) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const UserMessaging: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { status, error: authError, configured } = useMMAuth();
  const authenticated = status === 'ready';
  const authenticating = status === 'loading';

  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get or create user support channel
  const { channels, isLoading: channelsLoading, error: channelsError, refresh: refreshChannels } = useMattermostChannels({ enabled: authenticated });
  
  const supportChannel = useMemo(() => {
    if (!channels || !user) return null;
    return channels.find((ch) => ch.name === `support-${user.id}` || ch.type === 'D');
  }, [channels, user]);

  const timeline = useMattermostTimeline(supportChannel?.id || null, authenticated);
  const posts = timeline.posts;
  const sendMMMessage = timeline.sendMessage;
  const uploadFiles = timeline.uploadFiles;
  const userMap = timeline.userMap;
  const postsLoading = timeline.isLoading;
  const refreshPosts = timeline.refetch;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts]);

  // Note: Timeline auto-refreshes via React Query

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file size and type
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 50MB.`);
        return false;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
        toast.error(`${file.name} type is not allowed.`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) {
      toast.error('Please enter a message or attach files');
      return;
    }

    if (!supportChannel) {
      toast.error('Support channel not found. Please refresh the page.');
      return;
    }

    setSending(true);
    try {
      let fileIds: string[] = [];

      // Upload files first if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        toast.loading('Uploading files...', { id: 'upload' });
        
        const uploadedFiles = await uploadFiles(selectedFiles);
        fileIds = uploadedFiles.map((f) => f.id);
        
        toast.success('Files uploaded successfully', { id: 'upload' });
        setUploadingFiles(false);
      }

      // Send message
      await sendMMMessage(message, { fileIds });

      // Reset form
      setMessage('');
      setSelectedFiles([]);
      toast.success('Message sent successfully');
      
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      setUploadingFiles(false);
    }
  };

  const handleDownloadFile = (fileId: string, fileName: string) => {
    try {
      const url = `${mattermostClient.apiBaseUrl}/files/${fileId}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to the messaging service. Please check your configuration or try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (authenticating || channelsLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-gray-600">Connecting to support...</p>
        </div>
      </div>
    );
  }

  if (!supportChannel) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Support Channel Found</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              A support channel will be automatically created when you send your first message.
            </p>
            <Button onClick={refreshChannels}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const sortedPosts = [...posts]
    .filter((p) => p.channel_id === supportChannel.id)
    .sort((a, b) => a.create_at - b.create_at);

  return (
    <>
      <Helmet>
        <title>Support Messaging | HandyWriterz</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Support Chat
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Get help from our support team
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => refreshPosts()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-[500px] p-4">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Send a message to our support team and we'll get back to you shortly.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.map((post) => {
                    const author = userMap[post.user_id];
                    const isOwnMessage = post.user_id === user.id;
                    const attachments = post.metadata?.files || [];

                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              isOwnMessage ? 'opacity-90' : 'text-gray-700'
                            }`}>
                              {isOwnMessage ? 'You' : 'Support Team'}
                            </span>
                            <span className={`text-xs ${
                              isOwnMessage ? 'opacity-70' : 'text-gray-500'
                            }`}>
                              {formatDistanceToNow(post.create_at, { addSuffix: true })}
                            </span>
                          </div>
                          
                          {post.message && (
                            <p className="whitespace-pre-wrap break-words">
                              {post.message}
                            </p>
                          )}

                          {attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {attachments.map((file) => {
                                const isImage = file.mime_type?.startsWith('image/');
                                
                                return (
                                  <div
                                    key={file.id}
                                    className={`rounded-lg overflow-hidden ${
                                      isOwnMessage ? 'bg-primary-foreground/10' : 'bg-gray-50'
                                    }`}
                                  >
                                    {isImage ? (
                                      <div className="relative group cursor-pointer"
                                           onClick={() => handleDownloadFile(file.id, file.name)}>
                                        <img
                                          src={`${mattermostClient.apiBaseUrl}/files/${file.id}/thumbnail`}
                                          alt={file.name}
                                          className="w-full max-h-64 object-contain"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                          <Download className="h-8 w-8 text-white" />
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => handleDownloadFile(file.id, file.name)}
                                        className={`flex items-center gap-3 w-full p-3 transition ${
                                          isOwnMessage
                                            ? 'hover:bg-primary-foreground/20'
                                            : 'hover:bg-gray-100'
                                        }`}
                                      >
                                        <FileText className="h-5 w-5 flex-shrink-0" />
                                        <div className="flex-1 text-left min-w-0">
                                          <p className="text-sm font-medium truncate">{file.name}</p>
                                          <p className={`text-xs ${
                                            isOwnMessage ? 'opacity-70' : 'text-gray-500'
                                          }`}>
                                            {formatBytes(file.size)}
                                          </p>
                                        </div>
                                        <Download className="h-4 w-4 flex-shrink-0" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Composer */}
            <div className="border-t bg-gray-50 p-4 space-y-3">
              {/* Selected Files Preview */}
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {selectedFiles.map((file, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-2 pl-2 pr-1 py-1"
                      >
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-3 w-3" />
                        ) : (
                          <FileText className="h-3 w-3" />
                        )}
                        <span className="max-w-[150px] truncate text-xs">
                          {file.name}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatBytes(file.size)}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="hover:text-red-500 transition ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={3}
                  className="flex-1 resize-none"
                  disabled={sending || uploadingFiles}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={sending || uploadingFiles}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || uploadingFiles}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach Files
                  </Button>
                  <span className="text-xs text-gray-500">
                    Max 50MB per file
                  </span>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={sending || uploadingFiles || (!message.trim() && selectedFiles.length === 0)}
                >
                  {sending || uploadingFiles ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploadingFiles ? 'Uploading...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Press <kbd className="px-1 rounded bg-white border">Enter</kbd> to send,{' '}
                  <kbd className="px-1 rounded bg-white border">Shift+Enter</kbd> for new line
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Fast Response</h3>
              <p className="text-sm text-gray-700">
                Our team typically responds within 1 hour
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <Paperclip className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">Share Files</h3>
              <p className="text-sm text-gray-700">
                Attach documents, images, and more
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">24/7 Support</h3>
              <p className="text-sm text-gray-700">
                We're here to help anytime you need us
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserMessaging;
