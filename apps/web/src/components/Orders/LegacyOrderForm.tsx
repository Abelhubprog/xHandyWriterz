/**
 * LegacyOrderForm - Complete order form extracted from Dashboard
 * Uses the original dashboard order flow with file uploads and pricing
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  ChevronLeft,
  Calculator,
  PoundSterling,
  Clock4,
  Upload,
  X,
  Send,
  Loader2,
  FileText,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import useDocumentSubmission from '@/hooks/useDocumentSubmission';

// Helper function for bytes formatting
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const LegacyOrderForm: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [studyLevel, setStudyLevel] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [module, setModule] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; path: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [adminNotified, setAdminNotified] = useState(false);

  const supportAreas = [
    { id: 'adult', title: 'Adult Health Nursing' },
    { id: 'mental', title: 'Mental Health Nursing' },
    { id: 'child', title: 'Child Nursing' },
    { id: 'disability', title: 'Disability Nursing' },
    { id: 'social', title: 'Social Work' },
    { id: 'special', title: 'Special Education Needs' }
  ];

  const services = [
    { id: 'dissertation', title: 'Dissertation', desc: 'Expert dissertation writing support' },
    { id: 'essays', title: 'Essays', desc: 'Professional essay writing' },
    { id: 'reflection', title: 'Placement Reflections', desc: 'Clinical reflection writing' },
    { id: 'reports', title: 'Reports', desc: 'Detailed academic reports' },
    { id: 'portfolio', title: 'E-Portfolio', desc: 'Portfolio development' },
  ];

  const { submitDocuments, status: submissionStatus, error: submissionError } = useDocumentSubmission({
    onSuccess: (_submissionId, attachments) => {
      const uploaded = attachments.map((attachment) => ({
        name: attachment.filename,
        url: attachment.r2Key,
        path: attachment.r2Key,
      }));
      setUploadedFiles(uploaded);
      setAdminNotified(true);
      setUploading(false);
      setFiles([]);
      toast.success('Documents sent to admin successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit documents');
      setUploading(false);
    },
  });

  const calculatePrice = (words: number, service: string, level: string, date: string) => {
    if (words < 100 || words > 100000) {
      return null;
    }

    const daysUntilDue = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const useHigherRate =
      service === 'dissertation' ||
      level === 'Level 7' ||
      daysUntilDue < 2;

    const baseRate = useHigherRate ? 18 : 15;
    return (words / 275) * baseRate;
  };

  useEffect(() => {
    if (wordCount && studyLevel && dueDate && selectedService) {
      const price = calculatePrice(wordCount, selectedService.id, studyLevel, dueDate);
      setCalculatedPrice(price);
    }
  }, [wordCount, studyLevel, dueDate, selectedService]);

  const navigateToPaymentPage = (paymentDetails?: any) => {
    if (!selectedService || !wordCount || !studyLevel || !dueDate) {
      toast.error('Please complete all required fields before proceeding.');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload files before proceeding to payment.');
      return;
    }

    if (!adminNotified) {
      toast.error('Documents must be sent to admin before payment.');
      return;
    }

    const paymentData = paymentDetails || {
      orderId: `order-${Date.now()}`,
      amount: calculatedPrice,
      currency: 'GBP',
      orderDetails: {
        serviceType: selectedService.title,
        subjectArea: supportAreas.find(area => area.id === selectedArea)?.title || selectedArea,
        wordCount: wordCount,
        studyLevel: studyLevel,
        dueDate: dueDate,
        module: module,
        instructions: instructions
      },
      files: uploadedFiles
    };

    navigate('/payment', { state: { paymentData } });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 && uploadedFiles.length === 0) {
      toast.error('Please upload at least one file before proceeding to payment');
      return;
    }

    if (uploadedFiles.length > 0 && adminNotified) {
      navigateToPaymentPage({
        orderId: `ORD-${Date.now()}`,
        amount: calculatedPrice || 0,
        currency: 'USD',
        orderDetails: {
          serviceType: selectedService?.title || '',
          subjectArea: selectedArea || '',
          wordCount: wordCount,
          studyLevel: studyLevel,
          dueDate: dueDate,
          module: module,
          instructions: instructions
        },
        files: uploadedFiles
      });
      return;
    }

    handleUploadSubmit();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileList = Array.from(selectedFiles);
    const maxSize = 100 * 1024 * 1024; // 100MB
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileList.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (exceeds 100MB size limit)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Some files were rejected: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      const MAX_FILES = 10;
      const currentFiles = [...files];
      const newFiles = validFiles.filter(
        newFile =>
          !currentFiles.some(
            existingFile =>
              existingFile.name === newFile.name &&
              existingFile.size === newFile.size &&
              existingFile.lastModified === newFile.lastModified
          )
      );

      const totalFiles = [...currentFiles, ...newFiles];
      if (totalFiles.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed. Only the first ${MAX_FILES} files will be kept.`);
        setFiles(totalFiles.slice(0, MAX_FILES));
      } else {
        setFiles(totalFiles);
      }

      if (newFiles.length > 0) {
        toast.success(`${newFiles.length} file(s) added`);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    try {
      await submitDocuments(files, {
        serviceType: selectedService?.title || '',
        subjectArea: selectedArea || '',
        wordCount: wordCount,
        studyLevel: studyLevel,
        dueDate: dueDate,
        instructions: instructions
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Area Selection */}
        {!selectedArea && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Select Subject Area</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-4">\n                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{area.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Service Selection */}
        {selectedArea && !selectedService && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setSelectedArea(null)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Select Service Type</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-4">\n                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{service.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{service.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Form */}
        {selectedService && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setSelectedService(null)}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Word Count */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Word Count *
                </label>
                <input
                  type="number"
                  value={wordCount || ''}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 2000"
                  min="100"
                  max="100000"
                  required
                />
              </div>

              {/* Study Level */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Study Level *
                </label>
                <select
                  value={studyLevel}
                  onChange={(e) => setStudyLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select level</option>
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                  <option value="Level 6">Level 6</option>
                  <option value="Level 7">Level 7 (Masters)</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Module */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Module/Unit Code
                </label>
                <input
                  type="text"
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., NUR301"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Instructions *
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  placeholder="Provide detailed instructions for your order..."
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Upload Files *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-700"
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-500 dark:text-gray-400 mb-2" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Click to upload files</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 10 files, 100MB each</p>
                </button>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Display */}
              {calculatedPrice !== null && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Estimated Price:</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      GBP {calculatedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !files.length}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : adminNotified ? (
                  <>
                    <Send className="h-5 w-5" />
                    Proceed to Payment
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload & Submit Order
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegacyOrderForm;

