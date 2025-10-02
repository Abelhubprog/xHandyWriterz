/**
 * AdminMessaging - Admin-side messaging with file management
 * 
 * Features:
 * - View all user conversations
 * - Respond with text and files
 * - Access user-uploaded documents
 * - Mark conversations as resolved
 * - Real-time notifications
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, Filter, Archive, CheckCircle,
  Clock, User, Paperclip, Download, Send, Loader2,
  AlertCircle, RefreshCw, Eye, FileText, Image as ImageIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  mattermostClient,
  type MattermostChannel,
  type MattermostPost,
  type MattermostFileInfo,
  type MattermostUserProfile
} from '@/lib/mm-client';
import useMMAuth from '@/hooks/mattermost/useMMAuth';
import useMattermostChannels from '@/hooks/mattermost/useMattermostChannels';
import useMattermostTimeline from '@/hooks/mattermost/useMattermostTimeline';
import { env } from '@/env';

interface ConversationMetadata {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'open' | 'resolved' | 'archived';
  attachmentCount: number;
}

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes)) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
};

export const AdminMessaging: React.FC = () => {
  const { user, isAdmin, isEditor } = useAuth();
  const { status, error: authError, configured } = useMMAuth();
  const authenticated = status === 'ready';
  const authenticating = status === 'loading';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const {
    channels,
    isLoading: channelsLoading,
    error: channelsError,
    refresh: refreshChannels
  } = useMattermostChannels({ enabled: authenticated });

  const timeline = useMattermostTimeline(selectedChannel, authenticated);
  const posts = timeline.posts;
  const sendMessage = timeline.sendMessage;
  const uploadFiles = timeline.uploadFiles;
  const userMap = timeline.userMap;
  const postsLoading = timeline.isLoading;
  const refreshPosts = timeline.refetch;

  // Convert channels to conversations with metadata
  const conversations = useMemo<ConversationMetadata[]>(() => {
    if (!channels) return [];

    return channels
      .filter((channel) => {
        // Filter support channels (e.g., channels starting with "support-")
        return channel.name.startsWith('support-') || channel.type === 'D';
      })
      .map((channel) => {
        const channelPosts = posts.filter((p) => p.channel_id === channel.id);
        const lastPost = channelPosts[0];
        const attachmentCount = channelPosts.reduce(
          (sum, post) => sum + (post.metadata?.files?.length || 0),
          0
        );

        return {
          userId: channel.name.replace('support-', ''),
          userName: channel.display_name || channel.name,
          lastMessage: lastPost?.message || 'No messages',
          lastMessageAt: lastPost?.create_at ? new Date(lastPost.create_at).toISOString() : '',
          unreadCount: 0, // TODO: Calculate from mentions/unreads
          status: 'open' as const,
          attachmentCount,
        };
      });
  }, [channels, posts]);

  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    if (searchQuery) {
      filtered = filtered.filter(
        (conv) =>
          conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((conv) => conv.status === statusFilter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [conversations, searchQuery, statusFilter]);

  const selectedConversation = useMemo(() => {
    if (!selectedChannel) return null;
    return conversations.find((c) => {
      const channel = channels?.find((ch) => ch.id === selectedChannel);
      return channel && c.userId === channel.name.replace('support-', '');
    });
  }, [selectedChannel, conversations, channels]);

  const currentChannelPosts = useMemo(() => {
    return posts
      .filter((p) => p.channel_id === selectedChannel)
      .sort((a, b) => a.create_at - b.create_at);
  }, [posts, selectedChannel]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = async () => {
    if (!selectedChannel) return;
    if (!replyMessage.trim() && selectedFiles.length === 0) {
      toast.error('Please enter a message or attach files');
      return;
    }

    setSending(true);
    try {
      let fileIds: string[] = [];

      // Upload files first if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        const uploadedFiles = await uploadFiles(selectedFiles);
        fileIds = uploadedFiles.map((f) => f.id);
        setUploadingFiles(false);
      }

      // Send message
      await sendMessage(replyMessage, { fileIds });

      // Reset form
      setReplyMessage('');
      setSelectedFiles([]);
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
      setUploadingFiles(false);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const url = `${mattermostClient.apiBaseUrl}/files/${fileId}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    }
  };

  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access admin messaging.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to connect to messaging service. Please check your configuration.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (authenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Messaging | Support Center</title>
      </Helmet>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Support Messaging</h1>
          <p className="text-gray-600">Manage user conversations and file sharing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" variant="ghost" onClick={refreshChannels}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 space-y-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conversations</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[600px]">
                {channelsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredConversations.map((conv) => {
                      const channel = channels?.find((ch) =>
                        ch.name.includes(conv.userId)
                      );
                      const isSelected = channel?.id === selectedChannel;

                      return (
                        <motion.button
                          key={conv.userId}
                          onClick={() => setSelectedChannel(channel?.id || null)}
                          className={`w-full text-left p-3 rounded-lg border transition ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-sm">{conv.userName}</span>
                            </div>
                            {conv.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {conv.lastMessage}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {conv.lastMessageAt
                                ? formatDistanceToNow(new Date(conv.lastMessageAt), {
                                    addSuffix: true,
                                  })
                                : 'Never'}
                            </span>
                            {conv.attachmentCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {conv.attachmentCount}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversation View */}
          <Card className="lg:col-span-2">
            {!selectedChannel ? (
              <CardContent className="flex flex-col items-center justify-center h-[700px] text-gray-500">
                <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Select a conversation to view messages</p>
              </CardContent>
            ) : (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedConversation?.userName || 'User'}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedConversation?.attachmentCount || 0} attachments
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => refreshPosts()}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[450px] p-4">
                    {postsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : currentChannelPosts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentChannelPosts.map((post) => {
                          const author = userMap[post.user_id];
                          const isAdminMessage = post.user_id === user?.id;
                          const attachments = post.metadata?.files || [];

                          return (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  isAdmin
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <p className="text-xs mb-1 opacity-70">
                                  {author?.username || 'Unknown'} ·{' '}
                                  {formatDistanceToNow(post.create_at, { addSuffix: true })}
                                </p>
                                <p className="whitespace-pre-wrap">{post.message}</p>
                                {attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {attachments.map((file) => (
                                      <button
                                        key={file.id}
                                        onClick={() => handleDownloadFile(file.id, file.name)}
                                        className={`flex items-center gap-2 w-full p-2 rounded text-sm transition ${
                                          isAdmin
                                            ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
                                            : 'bg-white hover:bg-gray-50'
                                        }`}
                                      >
                                        {file.mime_type?.startsWith('image/') ? (
                                          <ImageIcon className="h-4 w-4" />
                                        ) : (
                                          <FileText className="h-4 w-4" />
                                        )}
                                        <span className="flex-1 truncate text-left">
                                          {file.name}
                                        </span>
                                        <span className="text-xs opacity-70">
                                          {formatBytes(file.size)}
                                        </span>
                                        <Download className="h-4 w-4" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Reply Composer */}
                  <div className="border-t p-4 space-y-3">
                    {selectedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, index) => (
                          <Badge key={index} variant="secondary" className="gap-2">
                            <Paperclip className="h-3 w-3" />
                            {file.name}
                            <button
                              onClick={() => removeFile(index)}
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                        className="flex-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <input
                          type="file"
                          id="admin-file-upload"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById('admin-file-upload')?.click()
                          }
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach Files
                        </Button>
                      </div>

                      <Button
                        onClick={handleSendReply}
                        disabled={sending || uploadingFiles}
                      >
                        {sending || uploadingFiles ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminMessaging;
