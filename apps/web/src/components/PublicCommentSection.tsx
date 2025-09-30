import React, { useState, useEffect } from 'react';
import { FLAGS } from '@/config/flags';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Heart,
  Reply,
  MoreVertical,
  Send,
  User as UserIcon,
  Clock,
  Flag,
  ThumbsUp,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import LoginPrompt from './auth/LoginPrompt';
import useAuthPrompt from '@/hooks/useAuthPrompt';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  replies: Comment[];
  isLiked?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface PublicCommentSectionProps {
  contentId: string;
  contentTitle: string;
  contentType: 'post' | 'article' | 'page';
  className?: string;
}

// Mock comments data (in production, this would come from your API)
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'This is an excellent article! The insights about adult health nursing practices are very valuable for healthcare professionals.',
    authorId: 'user1',
    authorName: 'Dr. Sarah M.',
    authorEmail: 'sarah@example.com',
    authorAvatar: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    likes: 12,
    replies: [
      {
        id: '1-1',
        content: 'I completely agree! The evidence-based approaches mentioned here are game-changing.',
        authorId: 'user2',
        authorName: 'James P.',
        authorEmail: 'james@example.com',
        createdAt: '2024-01-15T11:15:00Z',
        likes: 5,
        replies: []
      }
    ]
  },
  {
    id: '2',
    content: 'As a nursing student, this article helped me understand complex care protocols. Thank you for sharing!',
    authorId: 'user3',
    authorName: 'Emily K.',
    authorEmail: 'emily@example.com',
    createdAt: '2024-01-14T16:45:00Z',
    likes: 8,
    replies: []
  }
];

const PublicCommentSection: React.FC<PublicCommentSectionProps> = ({
  contentId,
  contentTitle,
  contentType,
  className = ''
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const {
    requireAuthForComment,
    requireAuthForLike,
    promptState,
    closePrompt,
    canPerformAction
  } = useAuthPrompt();

  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Note: early returns must come after all hook calls

  // Load comments when component mounts
  useEffect(() => {
    // In production, fetch comments from API
    // fetchComments(contentId);
  }, [contentId]);

  // If engagement is disabled, render the notice after hooks and effects are registered
  if (!FLAGS.engagement) {
    return (
      <div className={`rounded-lg border bg-card text-card-foreground shadow-sm p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">Comments are currently disabled.</p>
      </div>
    );
  }

  const handleSubmitComment = async () => {
    const success = requireAuthForComment(() => {
      if (!newComment.trim()) {
        toast.error('Please enter a comment');
        return;
      }

      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        const comment: Comment = {
          id: `new-${Date.now()}`,
          content: newComment.trim(),
          authorId: user?.id || 'unknown',
          authorName: user?.fullName || user?.username || 'Anonymous',
          authorEmail: user?.primaryEmailAddress?.emailAddress || '',
          authorAvatar: user?.imageUrl,
          createdAt: new Date().toISOString(),
          likes: 0,
          replies: [],
          canEdit: true,
          canDelete: true
        };

        setComments(prev => [comment, ...prev]);
        setNewComment('');
        setIsSubmitting(false);
        toast.success('Comment posted successfully!');
      }, 1000);
    });

    if (!success) {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string) => {
    requireAuthForLike(() => {
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        return comment;
      }));

      toast.success('Thanks for your feedback!');
    });
  };

  const handleReply = (commentId: string) => {
    requireAuthForComment(() => {
      setReplyingTo(commentId);
    });
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const reply: Comment = {
        id: `reply-${Date.now()}`,
        content: replyContent.trim(),
        authorId: user?.id || 'unknown',
        authorName: user?.fullName || user?.username || 'Anonymous',
        authorEmail: user?.primaryEmailAddress?.emailAddress || '',
        authorAvatar: user?.imageUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      };

      setComments(prev => prev.map(comment => {
        if (comment.id === replyingTo) {
          return {
            ...comment,
            replies: [...comment.replies, reply]
          };
        }
        return comment;
      }));

      setReplyContent('');
      setReplyingTo(null);
      setIsSubmitting(false);
      setExpandedReplies(prev => new Set([...prev, replyingTo!]));
      toast.success('Reply posted successfully!');
    }, 1000);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const CommentComponent: React.FC<{ comment: Comment; isReply?: boolean }> = ({
    comment,
    isReply = false
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-8 mt-3' : 'mb-6'} last:mb-0`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.authorAvatar ? (
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {getAuthorInitials(comment.authorName)}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">
              {comment.authorName}
            </span>
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatCommentDate(comment.createdAt)}
            </span>
          </div>

          {/* Content */}
          <div className="text-gray-800 text-sm leading-relaxed mb-3">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                comment.isLiked
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => handleReply(comment.id)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}

            {canPerformAction() && (comment.canEdit || comment.canDelete) && (
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => toggleReplies(comment.id)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {expandedReplies.has(comment.id)
                  ? `Hide ${comment.replies.length} replies`
                  : `Show ${comment.replies.length} replies`
                }
              </button>

              <AnimatePresence>
                {expandedReplies.has(comment.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    {comment.replies.map((reply) => (
                      <CommentComponent key={reply.id} comment={reply} isReply />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Discussion ({comments.length})
          </h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Join the conversation about "{contentTitle}"
        </p>
      </div>

      {/* Comment Form */}
      <div className="p-6 border-b border-gray-100">
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              canPerformAction()
                ? "Share your thoughts on this article..."
                : "Sign in to join the discussion..."
            }
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={!canPerformAction()}
          />

          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {canPerformAction()
                ? 'Be respectful and constructive in your comments'
                : 'Please sign in to comment'
              }
            </p>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6">
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-gray-500 font-medium mb-1">No comments yet</h4>
            <p className="text-gray-400 text-sm">
              Be the first to share your thoughts on this article!
            </p>
          </div>
        )}
      </div>

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={promptState.isOpen}
        onClose={closePrompt}
        action={promptState.action}
        title={promptState.title}
        description={promptState.description}
      />
    </div>
  );
};

export default PublicCommentSection;
