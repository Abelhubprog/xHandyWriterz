import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  FiUpload,
  FiDownload,
  FiTrash2,
  FiMoreVertical,
  FiFileText,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import  { formatFileSize, getFileIconByCategory, uploadFiles } from '../../services/fileUploadService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Globe, Lock, MoreVertical, Share2, Trash2, Upload, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Document type extending the database model
interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  file_type: string;
  category: string;
  description: string;
  uploaded_at: string;
  user_id: string;
  status: string;
  is_public: boolean;
}

const DocumentManager: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderFileIcon = (fileType: string) => {
    try {
      const Icon = getFileIconByCategory((fileType as unknown) as any);
      return <Icon className="h-4 w-4 text-muted-foreground" />;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, activeTab]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch list of files from R2 via Pages Function
      const prefix = user ? `orders/${user.id}/` : '';
      const res = await fetch(`/api/r2/list?prefix=${encodeURIComponent(prefix)}&delimiter=/&limit=100`);
      if (!res.ok) throw new Error('Failed to load documents');
      const json = await res.json();
      const files = (json.files || []) as Array<{ key: string; size: number; lastModified: string }>;
      // Map to Document shape (best-effort; server doesn’t have metadata rows yet)
      const mapped: Document[] = files.map((f, i) => ({
        id: f.key,
        filename: f.key.split('/').pop() || `file-${i}`,
        file_path: f.key,
        file_url: `/r2/${f.key}`,
        file_size: f.size,
        file_type: 'document',
        category: 'document',
        description: '',
        uploaded_at: f.lastModified || new Date().toISOString(),
        user_id: user?.id || 'unknown',
        status: 'approved',
        is_public: true,
      }));
      setDocuments(mapped);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load documents. Please try again later.');
      setIsLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      const folder = `orders/${user.id}`;
      const [result] = await uploadFiles([selectedFile], 'default', folder, (p) => setUploadProgress(p));
      if (!result?.success) {
        setError(result?.error || 'Upload failed');
        setIsUploading(false);
        return;
      }
      await fetchDocuments();
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(100);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      setError('Failed to upload file. Please try again.');
      setIsUploading(false);
    }
  };

  const handleShare = (doc: Document) => {
    alert(`Share functionality for ${doc.filename} is not implemented yet.`);
  };

  const handleTogglePublic = async (doc: Document) => {
    alert(`Toggle public functionality for ${doc.filename} is not implemented yet.`);
  };

  const handleUpdateStatus = async (doc: Document, status: Document['status']) => {
    alert(`Update status functionality for ${doc.filename} to ${status} is not implemented yet.`);
  };

  const handleDelete = async (docId: string, filePath: string) => {
    alert(`Delete functionality for ${docId} is not implemented yet.`);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery
      ? doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesTab = activeTab === 'all' ||
                       (activeTab === 'public' && doc.is_public) ||
                       (activeTab === 'private' && !doc.is_public);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Manager</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <Button
            className="ml-2 text-red-700"
            variant="ghost"
            onClick={() => setError(null)}
          >
            <span>&times;</span>
          </Button>
        </div>
      )}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload New Document</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
            ref={fileInputRef}
          />
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center">
                  <FiUpload className="mr-2" />
                  Uploading... {uploadProgress}%
                </span>
              ) : (
                <span className="flex items-center">
                  <FiUpload className="mr-2" />
                  Upload
                </span>
              )}
            </Button>
          )}
          {!selectedFile && (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
          )}
        </div>
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        {selectedFile && (
          <div className="mt-2 text-sm text-gray-600">
            Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="outline" onClick={fetchDocuments}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
          {user && <TabsTrigger value="private">Private</TabsTrigger>}
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="space-y-4 text-center">
                <Progress value={33} className="w-[200px]" />
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">No documents found</div>
              {user && (
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              )}
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {renderFileIcon(doc.file_type)}
                      <div>
                        <CardTitle className="text-base">{doc.filename}</CardTitle>
                        <CardDescription>
                          {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.is_public ? (
                        <Globe className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                      <Badge variant={
                        doc.status === 'approved' ? 'default' :
                        doc.status === 'rejected' ? 'destructive' :
                        doc.status === 'processing' ? 'secondary' :
                        'outline'
                      }>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-end space-x-2">
                    {(doc.is_public || (user && doc.user_id === user.id)) && (
                      <Button variant="outline" size="sm" onClick={() => window.open(doc.file_url, '_blank', 'noopener,noreferrer')}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}

                    <Button variant="outline" size="sm" onClick={() => handleShare(doc)}>
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>

                    {(isAdmin || (user && doc.user_id === user.id)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleTogglePublic(doc)}>
                            {doc.is_public ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Globe className="h-4 w-4 mr-2" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(doc, 'approved')}
                                disabled={doc.status === 'approved'}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(doc, 'rejected')}
                                disabled={doc.status === 'rejected'}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc.id, doc.file_path)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DocumentManager;
