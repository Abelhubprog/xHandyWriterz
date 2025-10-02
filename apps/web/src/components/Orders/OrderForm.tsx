/**
 * OrderForm Component - Production-Ready Order System with Mattermost Integration
 * 
 * Features:
 * - Complete order workflow
 * - Upload up to 10 files (all types)
 * - Automatic Mattermost channel creation
 * - Real-time file sharing with admin
 * - Progress tracking
 * - Price calculation
 */

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  X,
  FileText,
  Calculator,
  Calendar,
  BookOpen,
  GraduationCap,
  Send,
  Check,
  AlertCircle,
  Loader2,
  FileIcon,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mattermostClient, type MattermostFileInfo } from '@/lib/mm-client';
import useMMAuth from '@/hooks/mattermost/useMMAuth';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file

const SUBJECT_AREAS = [
  { id: 'nursing', title: 'Nursing', icon: '🏥' },
  { id: 'business', title: 'Business & Management', icon: '💼' },
  { id: 'engineering', title: 'Engineering', icon: '⚙️' },
  { id: 'computer-science', title: 'Computer Science', icon: '💻' },
  { id: 'law', title: 'Law', icon: '⚖️' },
  { id: 'psychology', title: 'Psychology', icon: '🧠' },
  { id: 'education', title: 'Education', icon: '📚' },
  { id: 'health-sciences', title: 'Health Sciences', icon: '🔬' },
  { id: 'social-sciences', title: 'Social Sciences', icon: '👥' },
  { id: 'other', title: 'Other', icon: '📖' },
];

const STUDY_LEVELS = [
  'High School',
  'Undergraduate',
  'Masters',
  'PhD',
  'Professional'
];

const SERVICE_TYPES = [
  { id: 'essay', title: 'Essay Writing', baseRate: 15 },
  { id: 'research', title: 'Research Paper', baseRate: 20 },
  { id: 'dissertation', title: 'Dissertation', baseRate: 25 },
  { id: 'coursework', title: 'Coursework', baseRate: 18 },
  { id: 'assignment', title: 'Assignment', baseRate: 15 },
  { id: 'editing', title: 'Editing & Proofreading', baseRate: 10 },
];

interface OrderFormProps {
  onSuccess?: (orderId: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSuccess }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { status: mmStatus, user: mmUser } = useMMAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [subjectArea, setSubjectArea] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [studyLevel, setStudyLevel] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [wordCount, setWordCount] = useState<number>(1000);
  const [dueDate, setDueDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [module, setModule] = useState<string>('');
  
  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [price, setPrice] = useState<number>(0);

  // Calculate price when relevant fields change
  useEffect(() => {
    if (serviceType && wordCount > 0 && studyLevel && dueDate) {
      const service = SERVICE_TYPES.find(s => s.id === serviceType);
      if (service) {
        const basePrice = (wordCount / 250) * service.baseRate;
        const levelMultiplier = studyLevel === 'PhD' ? 1.5 : studyLevel === 'Masters' ? 1.3 : 1.0;
        
        // Urgency multiplier based on days until due date
        const days = Math.max(1, Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        const urgencyMultiplier = days <= 1 ? 2.0 : days <= 3 ? 1.5 : days <= 7 ? 1.2 : 1.0;
        
        const calculatedPrice = basePrice * levelMultiplier * urgencyMultiplier;
        setPrice(Math.round(calculatedPrice * 100) / 100);
      }
    }
  }, [serviceType, wordCount, studyLevel, dueDate]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    
    // Validate file count
    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files`);
      return;
    }

    // Validate file sizes
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

  const validateForm = (): boolean => {
    if (!subjectArea) {
      toast.error('Please select a subject area');
      return false;
    }
    if (!serviceType) {
      toast.error('Please select a service type');
      return false;
    }
    if (!studyLevel) {
      toast.error('Please select your study level');
      return false;
    }
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return false;
    }
    if (wordCount < 250) {
      toast.error('Minimum word count is 250');
      return false;
    }
    if (!dueDate) {
      toast.error('Please select a due date');
      return false;
    }
    if (new Date(dueDate) <= new Date()) {
      toast.error('Due date must be in the future');
      return false;
    }
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return false;
    }
    return true;
  };

  const createOrderChannel = async (): Promise<string> => {
    try {
      // Get the default team
      const teams = await mattermostClient.listTeams();
      const defaultTeam = teams[0];
      
      if (!defaultTeam) {
        throw new Error('No Mattermost team available');
      }

      // Create a unique channel name for this order
      const timestamp = Date.now();
      const channelName = `order-${user?.id?.slice(0, 8) || 'user'}-${timestamp}`;
      const displayName = `Order: ${topic.slice(0, 30)} - ${user?.firstName || 'User'}`;

      // Create channel via API
      const response = await fetch(`${mattermostClient.apiBaseUrl}/channels`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          team_id: defaultTeam.id,
          name: channelName,
          display_name: displayName,
          type: 'P', // Private channel
          purpose: `Order submission - ${serviceType} - Due: ${dueDate}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order channel');
      }

      const channel = await response.json();
      return channel.id;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw new Error('Failed to create order channel');
    }
  };

  const uploadFilesToMattermost = async (channelId: string): Promise<MattermostFileInfo[]> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: MattermostFileInfo[] = [];
      const chunkSize = 3; // Upload 3 files at a time

      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const chunkResults = await mattermostClient.uploadFiles(channelId, chunk);
        uploadedFiles.push(...chunkResults);
        
        setUploadProgress(Math.round(((i + chunk.length) / files.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      }

      setUploadProgress(100);
      return uploadedFiles;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (mmStatus !== 'ready') {
      toast.error('Please wait for Mattermost connection');
      return;
    }

    setIsSubmitting(true);
    const newOrderId = `ORD-${Date.now()}`;
    setOrderId(newOrderId);

    try {
      // Step 1: Create dedicated order channel
      toast.loading('Creating order channel...', { id: 'order-submit' });
      const newChannelId = await createOrderChannel();
      setChannelId(newChannelId);

      // Step 2: Upload files to Mattermost
      toast.loading('Uploading files...', { id: 'order-submit' });
      const uploadedFiles = await uploadFilesToMattermost(newChannelId);

      // Step 3: Create order summary post with all details
      const orderSummary = `
📋 **New Order Submitted**

**Order ID:** ${newOrderId}
**Customer:** ${user?.firstName || ''} ${user?.lastName || ''} (${user?.primaryEmailAddress?.emailAddress || ''})

**Service Details:**
• Type: ${SERVICE_TYPES.find(s => s.id === serviceType)?.title || serviceType}
• Subject: ${SUBJECT_AREAS.find(s => s.id === subjectArea)?.title || subjectArea}
• Study Level: ${studyLevel}
• Topic: ${topic}
• Word Count: ${wordCount}
• Module: ${module || 'N/A'}
• Due Date: ${new Date(dueDate).toLocaleDateString()}

**Estimated Price:** £${price.toFixed(2)}

**Special Instructions:**
${instructions || 'None provided'}

**Attached Files:** ${uploadedFiles.length} file(s) uploaded
${uploadedFiles.map(f => `• ${f.name} (${formatFileSize(f.size)})`).join('\n')}

---
*Please review the requirements and respond in this channel with any questions or updates.*
      `.trim();

      await mattermostClient.createPost({
        channelId: newChannelId,
        message: orderSummary,
        fileIds: uploadedFiles.map(f => f.id)
      });

      // Step 4: Mark channel as viewed
      await mattermostClient.markChannelViewed(newChannelId);

      // Success!
      toast.success('Order submitted successfully!', { id: 'order-submit' });
      
      // Navigate to messages to show the new channel
      setTimeout(() => {
        navigate(`/dashboard/messages?channel=${newChannelId}`);
        onSuccess?.(newOrderId);
      }, 1000);

    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit order', { id: 'order-submit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Place Your Order</h1>
          <p className="text-blue-100">Fill out the form below to get started with your academic project</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subject Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <BookOpen className="inline w-4 h-4 mr-2" />
              Subject Area *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {SUBJECT_AREAS.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSubjectArea(area.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    subjectArea === area.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{area.icon}</div>
                  <div className="text-xs font-medium">{area.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FileText className="inline w-4 h-4 mr-2" />
              Service Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setServiceType(service.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    serviceType === service.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{service.title}</div>
                  <div className="text-sm text-gray-500">From £{service.baseRate}/page</div>
                </button>
              ))}
            </div>
          </div>

          {/* Study Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <GraduationCap className="inline w-4 h-4 mr-2" />
              Study Level *
            </label>
            <select
              value={studyLevel}
              onChange={(e) => setStudyLevel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your study level</option>
              {STUDY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Topic / Title *
            </label>
            <Input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your assignment topic or title"
              className="w-full"
              required
            />
          </div>

          {/* Word Count & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calculator className="inline w-4 h-4 mr-2" />
                Word Count *
              </label>
              <Input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                min="250"
                step="250"
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum: 250 words</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="inline w-4 h-4 mr-2" />
                Due Date *
              </label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
                required
              />
            </div>
          </div>

          {/* Module/Course Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Module / Course Code (Optional)
            </label>
            <Input
              type="text"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="e.g., BUS101, NUR301"
              className="w-full"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Special Instructions
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide any specific requirements, formatting guidelines, or additional notes..."
              className="w-full min-h-[120px]"
              rows={5}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Upload className="inline w-4 h-4 mr-2" />
              Upload Files * (Max {MAX_FILES} files)
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mb-2"
                disabled={files.length >= MAX_FILES || isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </Button>
              <p className="text-sm text-gray-500">
                All file types accepted • Max 100MB per file • {files.length}/{MAX_FILES} files
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
                      disabled={isUploading || isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Uploading files...</span>
                  <span className="text-blue-600 font-medium">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price Display */}
          {price > 0 && (
            <Alert>
              <Calculator className="w-4 h-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estimated Price:</span>
                  <span className="text-2xl font-bold text-blue-600">£{price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Final price may vary based on complexity and additional requirements
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Mattermost Auth Warning */}
          {mmStatus !== 'ready' && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Please wait for Mattermost connection. Navigate to Messages first to connect.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting || isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || mmStatus !== 'ready'}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Order...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Order (£{price.toFixed(2)})
                </>
              )}
            </Button>
          </div>

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              What happens next?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Your order will create a private Mattermost channel</li>
              <li>✓ All files will be uploaded and shared with the admin team</li>
              <li>✓ You'll receive real-time updates and can chat directly with your assigned writer</li>
              <li>✓ Files can be shared back and forth throughout the project</li>
              <li>✓ Payment will be processed after order confirmation</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
