import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import {
  FileText,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import database from '../../lib/d1Client';
import { telegramService, type TelegramFile } from '../../lib/telegram';

interface TurnitinUploadProps {
  onClose?: () => void;
}

// Dynamic SDK user type extension
interface DynamicUser {
  alias?: string;
  publicAddress?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  // Add any other properties you need
}

function TurnitinUpload({ onClose }: TurnitinUploadProps) {
  const { user } = useDynamicContext();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<TelegramFile[]>([]);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;

    const subscription = telegramService.subscribeToNewFiles(
      submissionId,
      (newFile: TelegramFile) => {
        setReceivedFiles(prev => [...prev, newFile]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [submissionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (max 20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF and Word documents are allowed');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    try {
      setUploading(true);
      setError(null);

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const dynamicUser = user as unknown as DynamicUser;
      const userId = dynamicUser.publicAddress || dynamicUser.email || 'anonymous';
      const filePath = `turnitin/${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create submission record
      const { data: submission, error: submissionError } = await supabase
        .from('turnitin_submissions')
        .insert({
          user_id: userId,
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          status: 'pending'
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      setSubmissionId(submission.id);
      setSuccess(true);

    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      setDownloadingFile(fileId);
      const file = await telegramService.downloadFile(fileId);

      if (file.download_url) {
        window.open(file.download_url, '_blank');
      }
    } catch (err) {
      setError('Failed to download file. Please try again.');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleModalClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Check Turnitin</h2>
          {onClose && (
            <button
              onClick={handleModalClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {!success ? (
            <div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center mb-6">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".doc,.docx,.pdf"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload a file</p>
                    <p className="text-sm text-gray-600">PDF or Word documents only (max 20MB)</p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {onClose && (
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600">File uploaded successfully!</p>

              {receivedFiles.length > 0 ? (
                <div className="mt-6">
                  <p className="text-gray-600 mb-4">Your Turnitin reports are ready:</p>
                  <div className="space-y-3">
                    {receivedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium">{file.file_name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.download_url && (
                            <button
                              onClick={() => window.open(file.download_url, '_blank')}
                              className="p-2 hover:bg-gray-200 rounded-lg"
                              title="View online"
                            >
                              <Eye className="h-5 w-5 text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(file.id)}
                            disabled={downloadingFile === file.id}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 disabled:opacity-50"
                          >
                            {downloadingFile === file.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Download className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-2">
                  You will receive the Turnitin reports shortly.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default export for lazy loading
export default TurnitinUpload;
