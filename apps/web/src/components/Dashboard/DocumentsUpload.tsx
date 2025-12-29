import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DocumentUploader } from '@/components/Dashboard/DocumentUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, Clock, CheckCheck } from 'lucide-react';

const DocumentsUpload: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirect if not signed in
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // If still loading, show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not signed in, don't render the page content
  if (!isSignedIn) {
    return null;
  }

  const handleUploadSuccess = (submissionId: string) => {
    // You could navigate to a success page or show more details
  };

  return (
    <>
      <Helmet>
        <title>Document Upload | HandyWriterz Dashboard</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload documents for admin review or your projects.
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents to Admin</CardTitle>
                <CardDescription>
                  Upload documents for review, order processing, or any other admin-related needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Please ensure all documents are formatted correctly and contain all necessary information.
                    Large files may take some time to upload depending on your connection speed.
                  </AlertDescription>
                </Alert>

                {/* Our document uploader component */}
                <DocumentUploader
                  maxFiles={10}
                  maxSizeInMB={100}
                  acceptedFileTypes={['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt', '.jpg', '.jpeg', '.png', '.mp4', '.mov', '.m4a', '.mp3', '.wav']}
                  buttonLabel="Select Documents"
                  dropzoneLabel="Drag and drop your documents here"
                  metadata={{
                    type: 'admin-review',
                    source: 'dashboard-upload'
                  }}
                  onSuccess={handleUploadSuccess}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload to Project</CardTitle>
                <CardDescription>
                  Upload documents directly to one of your current projects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This feature will be available soon. Stay tuned for updates!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
                <CardDescription>
                  View your recent document uploads and their status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would typically be populated from the API */}
                  <div className="flex items-start p-4 border rounded-lg">
                    <div className="mr-4 mt-1">
                      <CheckCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">Project Documentation</h4>
                        <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-50 rounded-full">Completed</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Uploaded 2 days ago</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-3.5 w-3.5 mr-1 text-blue-500" />
                        <span className="text-sm">3 files uploaded</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start p-4 border rounded-lg">
                    <div className="mr-4 mt-1">
                      <CheckCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">Research Materials</h4>
                        <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-50 rounded-full">Completed</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Uploaded 1 week ago</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-3.5 w-3.5 mr-1 text-blue-500" />
                        <span className="text-sm">5 files uploaded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>Document Upload Instructions</CardTitle>
                <CardDescription>
                  Follow these guidelines to ensure your documents are processed correctly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Accepted File Types</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Documents: PDF, DOC, DOCX, TXT, RTF, ODT</li>
                    <li>Images: JPG, JPEG, PNG</li>
                    <li>Maximum file size: 20MB per file</li>
                    <li>Maximum number of files per upload: 5</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Naming Conventions</h3>
                  <p className="text-sm">
                    For faster processing, please name your files using the following format:
                    <br />
                    <code className="bg-gray-100 px-1">[OrderID]_[DocumentType]_[YourName]</code>
                    <br />
                    Example: <code className="bg-gray-100 px-1">12345_Assignment_JohnDoe.pdf</code>
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Processing Time</h3>
                  <p className="text-sm">
                    Document uploads are typically processed within 24 hours. You will receive a notification once your documents have been reviewed.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Need Help?</h3>
                  <p className="text-sm">
                    If you encounter any issues with document uploads or have questions about document requirements, please contact our support team at <a href="mailto:support@handywriterz.com" className="text-blue-600 hover:underline">support@handywriterz.com</a> or use the in-app chat feature.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DocumentsUpload;
