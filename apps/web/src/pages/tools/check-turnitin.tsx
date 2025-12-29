import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, AlertCircle, CheckCircle, Loader2, X, Moon, Sun,
  ArrowRight, CreditCard, Mail, ArrowDown, Shield, BarChart, Clock, DollarSign, ArrowLeft, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Import D1 client and R2 client for Cloudflare integration
import { cloudflareDb } from '@/lib/cloudflare';
import database from '@/lib/d1Client';
import { r2Client } from '@/lib/cloudflareR2Client';

// Type definition for receipt
interface Receipt {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
  instructions?: string;
}

// Type definition for document upload steps
type Step = {
  id: number;
  title: string;
  completed: boolean;
  current: boolean;
}

interface FileUploadState {
  fileId: string | null;
  bucket: string | null;
  sha256: string | null;
  uploadProgress: number;
}

const TurnitinCheck: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
    fileId: null,
    bucket: null,
    sha256: null,
    uploadProgress: 0
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'failed'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal' | 'transfer' | 'later' | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [price, setPrice] = useState('5.00');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Using the corrected Step type for useState
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'Enter Email', completed: false, current: true },
    { id: 2, title: 'Upload Document', completed: false, current: false },
    { id: 3, title: 'Confirm Details', completed: false, current: false },
    { id: 4, title: 'Submit & Pay', completed: false, current: false },
    { id: 5, title: 'Receipt', completed: false, current: false },
  ]);

  // Handle dark mode toggle with improved persistence
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email submission
  const handleEmailSubmit = () => {
    if (!email) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError(null);
    updateStepStatus(1, true);
    goToNextStep();
  };

  // Handle file drop with improved validation
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];

      if (selectedFile.size > 20 * 1024 * 1024) {
        setError('File size must be less than 20MB');
        return;
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, DOC, DOCX, and TXT files are supported');
        return;
      }

      setFile(selectedFile);
      setError(null);
      // Don't mark step 2 completed here yet, only after successful upload initiation attempt
      // await handleFileUpload(selectedFile); // Call the new upload handler
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  // Update step status
  const updateStepStatus = (stepId: number, completed: boolean) => {
    setSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId) {
          return { ...step, completed };
        }
        return step;
      })
    );
  };

  // Progress to next step with animation
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setSteps(prevSteps =>
        prevSteps.map(step => {
          if (step.id === currentStep) {
            return { ...step, current: false, completed: true };
          } else if (step.id === currentStep + 1) {
            return { ...step, current: true };
          }
          return step;
        })
      );
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  // Format file size with improved readability
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Generate a receipt ID with better uniqueness
  const generateReceiptId = (): string => {
    return 'TRN-' + Date.now().toString(36).toUpperCase() + '-' +
           Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  // Calculate SHA256 hash of the file using Web Crypto API
  const calculateFileSHA256 = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {

      throw new Error('Failed to calculate file hash');
    }
  };

  // Handle file upload using signed URLs
  const handleFileUpload = async (fileToUpload: File) => {
    if (!fileToUpload) return false;

    setIsUploading(true);
    setError(null);
    setUploadStatus('uploading');
    setFileUploadState({ ...fileUploadState, uploadProgress: 0 });
    let overallSuccess = false;

    try {
      const calculatedSha256 = await calculateFileSHA256(fileToUpload);


      const fileExt = fileToUpload.name.split('.').pop();
      const randomFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `turnitin-uploads/${randomFileName}`; // Specific bucket/path for these uploads

      // Upload directly to R2 using the r2Client
      try {
        const uploadOptions = {
          contentType: fileToUpload.type,
          metadata: {
            sha256: calculatedSha256,
            originalName: fileToUpload.name
          },
          publicAccess: true
        };

        // Setup progress tracking
        const progressTracker = (progress: number) => {
          setFileUploadState(prev => ({ ...prev, uploadProgress: progress }));
        };

        // Upload the file using R2 client
        const uploadResult = await r2Client.uploadFile(fileToUpload, filePath, uploadOptions, progressTracker);

        // Get the public URL for the file
        const publicUrl = r2Client.getPublicUrl(filePath);

        setFileUploadState({
          fileId: filePath, // Using filePath as a unique identifier for now
          bucket: 'documents',
          sha256: calculatedSha256,
          uploadProgress: 100,
        });

        // Create Order using Cloudflare D1
        try {
          const orderPayload = {
            user_id: '', // This will be populated server-side if needed
            user_email: email, // from component state
            file_id: filePath,
            file_bucket: 'documents',
            file_sha256: calculatedSha256,
            file_name: fileToUpload.name,
            file_size: fileToUpload.size,
            service_name: 'Turnitin Plagiarism Check',
            price: parseFloat(price), // from component state
            currency: 'GBP',
            created_at: new Date().toISOString()
          };

          // Insert into orders table using D1 client
          const orderResult = await cloudflareDb.insert('orders', orderPayload as any);

          if ((orderResult as any)?.error) {
            setError(`Order creation failed: ${(orderResult as any).error}`);
            throw new Error(`Failed to create order: ${(orderResult as any).error}`);
          }

          if ((orderResult as any)?.id) {
            const orderId = (orderResult as any).id || Date.now().toString();
            setCreatedOrderId(orderId); // Save the created order ID
            setReceipt(prev => ({
              ...prev,
              id: orderId, // Use order ID as receipt ID
              amount: parseFloat(price),
              status: 'Pending Payment', // Initial status after order creation
              // other receipt details can be updated post-payment
            }));
          } else {
            // Handle cases where order response is missing
            // Fallback to generate a temporary ID
            const tempId = `temp-${Date.now()}`;
            setCreatedOrderId(tempId);
            setReceipt(prev => ({
              ...prev,
              id: tempId,
              amount: parseFloat(price),
              status: 'Pending Payment'
            }));
          }

          setUploadSuccess(true);
          setUploadStatus('success');
          updateStepStatus(2, true); // Mark 'Upload Document' step as completed
          updateStepStatus(3, false); // Ensure 'Confirm Details' is not marked completed yet
          goToNextStep(); // This should take us to 'Confirm Details' (step 3)
          overallSuccess = true;
        } catch (orderCreationError) {
          setError(orderCreationError instanceof Error ? `Order creation process failed: ${orderCreationError.message}` : 'Order creation process failed due to an unknown error.');
          setUploadStatus('failed'); // Reflect that the overall process hit a snag
          // Do not proceed to next step if order creation fails
          overallSuccess = false;
        }
      } catch (uploadError) {
        setError(`Upload to R2 failed: ${uploadError}`);
        setUploadStatus('failed');
        overallSuccess = false;
      }
    } catch (err) {
      setError(err instanceof Error ? `Upload process error: ${err.message}` : 'An unknown error occurred during the upload process.');
      setUploadStatus('failed');
      overallSuccess = false;
    } finally {
      setIsUploading(false);
    }
    return overallSuccess;
  };

  // Placeholder for renderStepContent - will be fully implemented later
  const renderStepContentInternal = () => {
    switch (currentStep) {
      case 1: // Enter Email
        return (
          <div className="p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-gray-800 dark:text-white">Enter Your Email Address</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">We'll send your plagiarism report to this email address.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                />
                {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Mail size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Email Delivery</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Your comprehensive plagiarism report will be delivered within 24 hours to this email address.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleEmailSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );
      case 2: // Upload Document
        return (
          <div className="p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-gray-800 dark:text-white">Upload Your Document</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Upload the document you want to check for plagiarism.</p>
            <div
              {...getRootProps()}
              className={`p-8 lg:p-10 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-blue-500 transition-all duration-200
                ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' : 'border-gray-300 dark:border-gray-600'}
                ${darkMode ? 'dark' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              {isDragActive ? (
                <div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Drop your document here</p>
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-1">Release to upload</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Drag & drop your document here</p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse files</p>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload size={16} className="mr-2" />
                    Choose File
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Max file size: 20MB • Supported: PDF, DOC, DOCX, TXT</p>
            </div>
            {file && (
              <div className="mt-6 p-4 lg:p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFile(null); setFileUploadState({ fileId: null, bucket: null, sha256: null, uploadProgress: 0 }); }}
                    aria-label="Remove selected file"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                {isUploading && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${fileUploadState.uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 text-center">{fileUploadState.uploadProgress}% uploaded</p>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Upload Error</h4>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => file && handleFileUpload(file)}
              disabled={!file || isUploading || uploadStatus === 'success'}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isUploading ? <><Loader2 size={18} className="animate-spin"/> Uploading...</> : (uploadStatus === 'success' ? <><CheckCircle size={18}/> Successfully Uploaded</> : <>Upload & Continue <ArrowRight size={18}/></>)}
            </button>
          </div>
        );
      case 3: // Confirm Details
        return (
          <div className="p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-gray-800 dark:text-white">Confirm Order Details</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please review your order details before proceeding to payment.</p>
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">File Name:</span>
                <span className="font-medium text-gray-800 dark:text-white">{file?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">File Size:</span>
                <span className="font-medium text-gray-800 dark:text-white">{file ? formatFileSize(file.size) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Service:</span>
                <span className="font-medium text-gray-800 dark:text-white">Turnitin Plagiarism Check</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Cost:</span>
                <span className="font-medium text-green-600 dark:text-green-400">£{price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Email Address:</span>
                <span className="font-medium text-gray-800 dark:text-white">{email}</span>
              </div>
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg flex items-start gap-3">
                  <Shield size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Document Analysis Process</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Your document will be thoroughly analyzed for plagiarism using our advanced AI tools and Turnitin's comprehensive database of academic content, websites, and publications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between">
              <button
                onClick={() => setCurrentStep(prev => prev -1)}
                className="order-2 sm:order-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                onClick={goToNextStep}
                className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Proceed to Payment <ArrowRight size={18}/>
              </button>
            </div>
          </div>
        );
      case 4: // Submit & Pay
        return (
          <div className="p-6 lg:p-8">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-gray-800 dark:text-white">Choose Payment Method</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Select your preferred payment method to complete your order.</p>

            {/* Order Summary */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Turnitin Plagiarism Check</span>
                <span className="font-semibold text-green-600 dark:text-green-400">£{price}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-8">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Payment Options</h3>

              <button className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Cryptocurrency</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Bitcoin, Ethereum, USDC</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              <button className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PP</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">PayPal</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Secure PayPal payment</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              <button className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <DollarSign size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Bank Transfer</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Direct bank transfer</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>

              <button className="w-full text-left p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">Pay Later</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Process now, pay within 7 days</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <button
                onClick={() => setCurrentStep(prev => prev -1)}
                className="order-2 sm:order-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>
            </div>
          </div>
        );
      case 5: // Receipt
        return (
          <div className="p-6 lg:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your document has been submitted for plagiarism analysis.</p>
            </div>

            {receipt && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="font-mono text-sm text-gray-800 dark:text-white">{receipt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">£{receipt.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="text-gray-800 dark:text-white">{new Date(receipt.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                    <span className="text-gray-800 dark:text-white">{receipt.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                      receipt.status === 'Paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {receipt.status}
                    </span>
                  </div>
                  {receipt.instructions && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400"><strong>Instructions:</strong> {receipt.instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">What Happens Next?</h3>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <p>• Your document is being processed by our AI plagiarism detection system</p>
                <p>• You'll receive a comprehensive report within 24 hours via email</p>
                <p>• The report will include similarity percentages and source citations</p>
                <p>• You can track your order status in your dashboard</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Home size={18} /> Return to Homepage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Start New Check
              </button>
            </div>
          </div>
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  // Production version - debug logging removed

  // Ensuring the component returns a valid ReactNode
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </button>
              <div className="text-gray-300 dark:text-gray-600">/</div>
              <span className="text-gray-900 dark:text-white font-medium">Turnitin Check</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Progress Steps */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-2">Turnitin Check</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Professional plagiarism detection service</p>
          </div>

          {/* Progress Steps - Mobile Horizontal, Desktop Vertical */}
          <div className="lg:space-y-4">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-4 lg:space-x-0 pb-4 lg:pb-0">
              {steps.map((step, index) => (
                <div key={step.id} className="flex lg:flex-row items-center min-w-0 flex-shrink-0 lg:flex-shrink">
                  <div className={`flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-3 ${step.current || step.completed ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    <div
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0
                        ${step.completed ? 'bg-blue-600 border-blue-600 text-white' : (step.current ? 'border-blue-600 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600')}`}
                    >
                      {step.completed ? <CheckCircle size={16} /> : <span className="text-sm font-medium">{step.id}</span>}
                    </div>
                    <div className="text-center lg:text-left">
                      <p className={`text-xs lg:text-sm font-medium ${step.current ? 'text-blue-600 dark:text-blue-400' : ''}`}>{step.title}</p>
                      {step.current && <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">Current step</p>}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-auto border-t-2 lg:border-t-0 lg:border-l-2 transition-colors duration-300 mx-4 lg:mx-0 lg:ml-5 lg:mt-4 lg:h-8
                      ${step.completed ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Service Info */}
          <div className="mt-6 lg:mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Service Details</span>
            </div>
            <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <p>• Professional plagiarism detection</p>
              <p>• Comprehensive database analysis</p>
              <p>• Detailed similarity report</p>
              <p>• Fast 24-hour turnaround</p>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Price:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">£{price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">

            {/* Step Content Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContentInternal()}
                </motion.div>
              </AnimatePresence>
            </div>
            {import.meta.env.DEV && <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">Debug: Step {currentStep}, Status: {uploadStatus}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnitinCheck;
