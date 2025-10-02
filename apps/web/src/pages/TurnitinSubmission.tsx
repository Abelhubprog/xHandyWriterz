import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { env } from '@/env';
import emailService from '@/services/emailService';

type UploadedFile = { r2Key: string; filename: string; size: number; contentType: string };

const ACCEPTED_TYPES = ['.doc', '.docx', '.md', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TURNITIN_FEE = 9.99;

const TurnitinSubmission: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  
  // UI state
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'confirm'>('form');
  
  const brokerUrl = useMemo(() => env.VITE_UPLOAD_BROKER_URL?.replace(/\/$/, '') ?? '', []);

  // Validation
  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isFormValid = useMemo(() => {
    return isEmailValid && files.length > 0;
  }, [isEmailValid, files.length]);

  // File validation
  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ACCEPTED_TYPES.includes(extension)) {
      return `Invalid file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    
    return null;
  };

  // Handle file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  };

  // Remove file
  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    toast.success('File removed');
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Upload files to R2
  const uploadFiles = async (): Promise<UploadedFile[]> => {
    if (!brokerUrl) {
      throw new Error('Upload broker not configured. Contact support.');
    }

    const uploaded: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      toast.loading(`Uploading ${file.name} (${i + 1}/${files.length})...`, { id: 'upload' });

      const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const key = `turnitin/${Date.now()}-${safeName}`;

      try {
        // Get presigned URL
        const presignRes = await fetch(`${brokerUrl}/s3/presign-put`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ 
            key, 
            contentType: file.type || 'application/octet-stream' 
          }),
        });

        if (!presignRes.ok) {
          throw new Error(await presignRes.text().catch(() => 'Failed to get upload URL'));
        }

        const { url } = await presignRes.json();
        if (!url) throw new Error('Upload URL missing');

        // Upload file
        const putRes = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'content-type': file.type || 'application/octet-stream' },
        });

        if (!putRes.ok) {
          throw new Error(await putRes.text().catch(() => 'Failed to upload file'));
        }

        uploaded.push({
          r2Key: key,
          filename: file.name,
          size: file.size,
          contentType: file.type,
        });

        toast.success(`${file.name} uploaded`, { id: 'upload' });
      } catch (error: any) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`, { id: 'upload' });
        throw error;
      }
    }

    return uploaded;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setUploading(true);
      toast.loading('Uploading documents...', { id: 'submit' });

      // Upload files
      const uploaded = await uploadFiles();

      // Generate order ID
      const orderId = uuidv4();

      // Store submission data
      const submission = {
        kind: 'turnitin',
        orderId,
        email,
        notes,
        attachments: uploaded,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(`turnitin:${orderId}`, JSON.stringify(submission));

      // Send confirmation emails
      toast.loading('Sending confirmation emails...', { id: 'submit' });

      try {
        await Promise.all([
          emailService.notifyAdminTurnitinSubmission({
            userEmail: email,
            orderId,
            files: uploaded,
            notes,
            amount: TURNITIN_FEE,
            currency: 'USD',
          }),
          emailService.sendUserSubmissionConfirmation({
            userEmail: email,
            orderId,
            files: uploaded,
            notes,
            amount: TURNITIN_FEE,
            currency: 'USD',
          }),
        ]);
      } catch (emailError: any) {
        console.error('Email notification failed:', emailError);
        // Don't block the flow if emails fail
        toast.error('Submission successful but email notification failed', { id: 'submit' });
      }

      toast.success('Documents uploaded successfully!', { id: 'submit' });

      // Navigate to payment
      navigate('/payment', {
        state: {
          paymentData: {
            orderId,
            amount: TURNITIN_FEE,
            currency: 'USD',
            customerEmail: email,
            orderDetails: {
              serviceType: 'Turnitin Plagiarism Check',
              subjectArea: 'General',
              wordCount: 0,
              studyLevel: 'N/A',
              dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              module: 'Plagiarism Check',
              instructions: notes || 'Standard Turnitin plagiarism check',
            },
            files: uploaded.map(f => ({ 
              name: f.filename, 
              url: '', 
              path: f.r2Key 
            })),
          },
        },
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.message || 'Failed to submit. Please try again.', { id: 'submit' });
    } finally {
      setUploading(false);
    }
  };

  // Confirm details step
  if (currentStep === 'confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Confirm Your Submission</CardTitle>
            <CardDescription className="text-indigo-100">
              Review your details before proceeding to payment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Email */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Email Address
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{email}</p>
            </div>

            {/* Files */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                Documents ({files.length})
              </div>
              <ul className="space-y-2">
                {files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 p-2 rounded">
                    <span className="text-gray-900 dark:text-white">{file.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notes */}
            {notes && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Additional Notes</div>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{notes}</p>
              </div>
            )}

            {/* Cost */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Amount</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    ${TURNITIN_FEE.toFixed(2)} USD
                  </div>
                </div>
                <div className="text-right text-xs text-gray-600 dark:text-gray-400">
                  <div>Turnitin Check</div>
                  <div>24-48 hour delivery</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('form')}
                className="flex-1"
                disabled={uploading}
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {uploading ? 'Processing...' : 'Submit & Pay'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form step
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Turnitin Plagiarism Check
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload your document for professional plagiarism detection
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">No login required • Fast processing</span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Submit Your Document
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Step 1 of 2: Provide your details and upload documents
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="text-base font-semibold">
                Your Email Address *
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                We'll send your reports and updates to this email
              </p>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="text-lg"
                required
              />
              {email && !isEmailValid && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-base font-semibold">
                Upload Document *
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Accepted formats: {ACCEPTED_TYPES.join(', ')} • Max size: 10MB
              </p>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Choose Files
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(',')}
                  onChange={onFileChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  or drag and drop your files here
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Files ({files.length})
                  </div>
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-base font-semibold">
                Additional Notes (Optional)
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Any special instructions or requirements
              </p>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., specific formatting requirements, deadline concerns, etc."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Pricing Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Service Fee</div>
                  <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                    ${TURNITIN_FEE.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">per document check</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    What you get:
                  </div>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>✅ Full Turnitin scan</li>
                    <li>✅ 2 detailed PDF reports</li>
                    <li>✅ 24-48 hour delivery</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => setCurrentStep('confirm')}
              disabled={!isFormValid}
              className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isEmailValid ? 'Enter valid email' : files.length === 0 ? 'Upload document' : 'Continue to Confirm'}
            </Button>

            {/* Help Text */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              By submitting, you agree to our terms of service. Your payment is secured and processed safely.
            </p>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Secure Upload
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Fast Processing
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Expert Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnitinSubmission;
