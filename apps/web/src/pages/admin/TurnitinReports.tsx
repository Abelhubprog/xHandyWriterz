import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { 
  Upload, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Clock,
  User,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { env } from '@/env';
import emailService from '@/services/emailService';

interface TurnitinSubmission {
  orderId: string;
  email: string;
  notes: string;
  attachments: Array<{ filename: string; size: number; r2Key: string }>;
  timestamp: string;
}

const TurnitinReports: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [orderId, setOrderId] = useState('');
  const [submission, setSubmission] = useState<TurnitinSubmission | null>(null);
  const [report1, setReport1] = useState<File | null>(null);
  const [report2, setReport2] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const brokerUrl = env.VITE_UPLOAD_BROKER_URL?.replace(/\/$/, '') ?? '';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Search for order
  const handleSearch = () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    try {
      // Search in localStorage
      const storageKey = `turnitin:${orderId}`;
      const data = localStorage.getItem(storageKey);
      
      if (!data) {
        toast.error('Order not found');
        setSubmission(null);
        return;
      }

      const parsed = JSON.parse(data);
      setSubmission(parsed);
      toast.success('Order found!');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to load order');
      setSubmission(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Upload PDF to R2
  const uploadPdf = async (file: File): Promise<string> => {
    if (!brokerUrl) {
      throw new Error('Upload broker not configured');
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const key = `turnitin-reports/${orderId}/${Date.now()}-${safeName}`;

    // Get presigned URL
    const presignRes = await fetch(`${brokerUrl}/s3/presign-put`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 
        key, 
        contentType: 'application/pdf' 
      }),
    });

    if (!presignRes.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { url } = await presignRes.json();

    // Upload file
    const putRes = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'content-type': 'application/pdf' },
    });

    if (!putRes.ok) {
      throw new Error('Failed to upload file');
    }

    // Get download URL
    const downloadRes = await fetch(`${brokerUrl}/s3/presign`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 
        key,
        expires: 2592000 // 30 days
      }),
    });

    if (!downloadRes.ok) {
      throw new Error('Failed to generate download URL');
    }

    const { url: downloadUrl } = await downloadRes.json();
    return downloadUrl;
  };

  // Submit reports
  const handleSubmit = async () => {
    if (!submission) {
      toast.error('No order selected');
      return;
    }

    if (!report1 || !report2) {
      toast.error('Please upload both reports');
      return;
    }

    if (report1.type !== 'application/pdf' || report2.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading reports...', { id: 'upload' });

      // Upload both PDFs
      const [url1, url2] = await Promise.all([
        uploadPdf(report1),
        uploadPdf(report2),
      ]);

      toast.loading('Sending notification email...', { id: 'upload' });

      // Send email to user
      await emailService.sendReportsReady({
        userEmail: submission.email,
        orderId: submission.orderId,
        reportUrls: [url1, url2],
      });

      toast.success('Reports sent to user!', { id: 'upload' });

      // Clear form
      setReport1(null);
      setReport2(null);
      setSubmission(null);
      setOrderId('');

    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Failed to send reports', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Turnitin Reports Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload and send Turnitin reports to customers
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Order
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Enter the order ID to load submission details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Order ID (e.g., abc123...)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submission Details */}
        {submission && (
          <>
            <Card className="mb-6 shadow-lg border-2 border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Customer Email</div>
                      <div className="font-medium text-gray-900 dark:text-white">{submission.email}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Order ID</div>
                      <div className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                        {submission.orderId.slice(0, 16)}...
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Submitted</div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatDate(submission.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
                      <div className="font-medium text-gray-900 dark:text-white">$9.99 USD</div>
                    </div>
                  </div>
                </div>

                {/* Files */}
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Submitted Documents ({submission.attachments.length})
                  </div>
                  <div className="space-y-2">
                    {submission.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.filename}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {submission.notes && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-1">
                      Customer Notes
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {submission.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Reports Card */}
            <Card className="mb-6 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Turnitin Reports
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Upload both PDF reports to send to the customer
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Report 1 */}
                <div>
                  <Label htmlFor="report1" className="text-base font-semibold mb-2 block">
                    Report 1 (Originality Report) *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <Label
                      htmlFor="report1"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Choose PDF File
                    </Label>
                    <Input
                      id="report1"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setReport1(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {report1 && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        {report1.name} ({formatFileSize(report1.size)})
                      </div>
                    )}
                  </div>
                </div>

                {/* Report 2 */}
                <div>
                  <Label htmlFor="report2" className="text-base font-semibold mb-2 block">
                    Report 2 (Detailed Analysis) *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <Label
                      htmlFor="report2"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Choose PDF File
                    </Label>
                    <Input
                      id="report2"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setReport2(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {report2 && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        {report2.name} ({formatFileSize(report2.size)})
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!report1 || !report2 || uploading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {uploading ? 'Sending...' : 'Upload & Send to Customer'}
                </Button>

                {/* Info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">What happens next:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Both PDFs will be uploaded to secure storage</li>
                      <li>Customer will receive an email with download links</li>
                      <li>Links will be valid for 30 days</li>
                      <li>You'll see a confirmation once sent</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* No Order Selected */}
        {!submission && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Order Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter an order ID above to load submission details
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TurnitinReports;
