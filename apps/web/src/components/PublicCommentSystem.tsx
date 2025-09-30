import React, { useState, useEffect } from 'react';
import { FLAGS } from '@/config/flags';
import { useUser, useAuth, SignInButton } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Flag,
  Send,
  User,
  Calendar,
  MoreHorizontal,
  Heart,
  Share2,
  Lock
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    role?: 'user' | 'admin' | 'moderator';
  };
  createdAt: string;
  updatedAt?: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
  isEdited: boolean;
  parentId?: string;
  postId: string;
  serviceType: string;
  userVote?: 'like' | 'dislike' | null;
}

interface PublicCommentSystemProps {
  postId: string;
  serviceType: string;
  className?: string;
  allowAnonymous?: boolean;
  moderationRequired?: boolean;
}

const PublicCommentSystem: React.FC<PublicCommentSystemProps> = ({
  postId,
  serviceType,
  className = '',
  allowAnonymous = false,
  moderationRequired = true
}) => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Mock data for demonstration
  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'This is an excellent resource for understanding adult health nursing concepts. The examples provided are very practical and applicable to real-world scenarios.',
      author: {
        id: 'user_1',
        name: 'Johnson, M.',
        isVerified: true,
        role: 'user'
      },
      createdAt: '2024-03-10T10:30:00Z',
      likes: 15,
      dislikes: 2,
      replies: [
        {
          id: '2',
          content: 'I completely agree! The case studies were particularly helpful for my coursework.',
          author: {
            id: 'user_2',
            name: 'Smith, K.',
            isVerified: true,
            role: 'user'
          },
          createdAt: '2024-03-10T11:15:00Z',
          likes: 8,
          dislikes: 0,
          replies: [],
          isEdited: false,
          parentId: '1',
          postId,
          serviceType,
          userVote: null
        }
      ],
      isEdited: false,
      postId,
      serviceType,
      userVote: null
    },
    {
      id: '3',
      content: 'As an educator in this field, I appreciate the depth of research and evidence-based practice guidelines included in this content.',
      author: {
        id: 'admin_1',
        name: 'Dr. Williams, A.',
        isVerified: true,
        role: 'admin'
      },
      createdAt: '2024-03-09T16:45:00Z',
      likes: 23,
      dislikes: 1,
      replies: [],
      isEdited: false,
      postId,
      serviceType,
      userVote: null
    }
  ];

  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setComments(mockComments);
      } catch (error) {
        toast.error('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [postId]);

  // If engagement is disabled, render the notice only after hooks have been initialized
  if (!FLAGS.engagement) {
    return (
      <div className={`rounded-lg border bg-card text-card-foreground shadow-sm p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">Comments are currently disabled.</p>
      </div>
    );
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn && !allowAnonymous) {
      setShowLoginPrompt(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (newComment.length < 10) {
      toast.error('Comment must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      const comment: Comment = {
        id: `comment_${Date.now()}`,
        content: newComment.trim(),
        author: {
          id: user?.id || 'anonymous',
          name: user ? getDisplayName(user) : 'Anonymous User',
          isVerified: !!user,
          role: 'user'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: [],
        isEdited: false,
        postId,
        serviceType,
        userVote: null
      };

      // TODO: Send to API
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success(moderationRequired ? 'Comment submitted for review' : 'Comment posted successfully');
    } catch (error) {
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isSignedIn && !allowAnonymous) {
      setShowLoginPrompt(true);
      return;
    }

    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      const reply: Comment = {
        id: `reply_${Date.now()}`,
        content: replyContent.trim(),
        author: {
          id: user?.id || 'anonymous',
          name: user ? getDisplayName(user) : 'Anonymous User',
          isVerified: !!user,
          role: 'user'
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        replies: [],
        isEdited: false,
        parentId,
        postId,
        serviceType,
        userVote: null
      };

      // Add reply to parent comment
      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        )
      );

      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply posted successfully');
    } catch (error) {
      toast.error('Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, voteType: 'like' | 'dislike', isReply = false, parentId?: string) => {
    if (!isSignedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      // Update vote state optimistically
      if (isReply && parentId) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          likes: voteType === 'like' ? reply.likes + 1 : reply.likes,
                          dislikes: voteType === 'dislike' ? reply.dislikes + 1 : reply.dislikes,
                          userVote: voteType
                        }
                      : reply
                  )
                }
              : comment
          )
        );
      } else {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: voteType === 'like' ? comment.likes + 1 : comment.likes,
                  dislikes: voteType === 'dislike' ? comment.dislikes + 1 : comment.dislikes,
                  userVote: voteType
                }
              : comment
          )
        );
      }

      // TODO: Send vote to API
      toast.success(`Comment ${voteType}d`);
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const getDisplayName = (user: any): string => {
    if (user.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[names.length - 1]}, ${names[0].charAt(0)}.`;
      }
      return user.fullName;
    }
    return user.username || user.primaryEmailAddress?.emailAddress || 'User';
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', color: 'text-red-600 bg-red-100' };
      case 'moderator':
        return { text: 'Moderator', color: 'text-purple-600 bg-purple-100' };
      default:
        return { text: 'Verified', color: 'text-blue-600 bg-blue-100' };
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return (b.likes - b.dislikes) - (a.likes - a.dislikes);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              Comments ({comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0)})
            </h3>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Comment Form */}
      <div className="p-6 border-b">
        {isLoaded && isSignedIn ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts... (minimum 10 characters)"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  maxLength={1000}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/1000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || newComment.length < 10}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Join the Conversation</h4>
            <p className="text-gray-600 mb-4">
              Sign in to share your thoughts and engage with the community
            </p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto">
                <User className="h-4 w-4" />
                Sign In to Comment
              </button>
            </SignInButton>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-100">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => (
            <div key={comment.id} className="p-6">
              {/* Comment */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.author.name}</span>
                    {comment.author.isVerified && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleDisplay(comment.author.role).color}`}>
                        {getRoleDisplay(comment.author.role).text}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3">{comment.content}</p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleVote(comment.id, 'like')}
                      className={`flex items-center gap-1 text-sm hover:text-blue-600 ${
                        comment.userVote === 'like' ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {comment.likes}
                    </button>

                    <button
                      onClick={() => handleVote(comment.id, 'dislike')}
                      className={`flex items-center gap-1 text-sm hover:text-red-600 ${
                        comment.userVote === 'dislike' ? 'text-red-600' : 'text-gray-500'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      {comment.dislikes}
                    </button>

                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                    >
                      <Reply className="h-4 w-4" />
                      Reply
                    </button>

                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmitReply(comment.id);
                        }}
                        className="space-y-3"
                      >
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full p-2 border border-gray-300 rounded-md resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isSubmitting || !replyContent.trim()}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="text-gray-600 px-3 py-1 rounded text-sm hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 ml-4 space-y-4 border-l-2 border-gray-100 pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="h-6 w-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{reply.author.name}</span>
                              {reply.author.isVerified && (
                                <span className={`px-1 py-0.5 rounded text-xs font-medium ${getRoleDisplay(reply.author.role).color}`}>
                                  {getRoleDisplay(reply.author.role).text}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-gray-700 text-sm mb-2">{reply.content}</p>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleVote(reply.id, 'like', true, comment.id)}
                                className={`flex items-center gap-1 text-xs hover:text-blue-600 ${
                                  reply.userVote === 'like' ? 'text-blue-600' : 'text-gray-500'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {reply.likes}
                              </button>

                              <button
                                onClick={() => handleVote(reply.id, 'dislike', true, comment.id)}
                                className={`flex items-center gap-1 text-xs hover:text-red-600 ${
                                  reply.userVote === 'dislike' ? 'text-red-600' : 'text-gray-500'
                                }`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                                {reply.dislikes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
            <p className="text-gray-600">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCommentSystem;
