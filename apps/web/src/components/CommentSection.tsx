import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DatabaseService from '@/services/databaseService';
import { formatRelativeTime } from '@/utils/formatDate';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface CommentSectionProps {
  postId?: string;
  servicePageId?: string;
  isStatic?: boolean;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, servicePageId, isStatic = false }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        let commentsData;
        if (postId) {
          commentsData = await DatabaseService.getCommentsByPostId(postId);
        } else if (servicePageId) {
          // Reuse same API for now, can be updated later to have separate function
          commentsData = await DatabaseService.getCommentsByPostId(servicePageId);
        }
        
        if (commentsData) {
          setComments(commentsData);
        }
      } catch (err) {
        setError('Failed to load comments');
      }
    };

    if (!isStatic && (postId || servicePageId)) {
      loadComments();
    }
  }, [postId, servicePageId, isStatic]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let comment;
      if (postId) {
        comment = await DatabaseService.submitComment(postId, user.id, newComment);
      } else if (servicePageId) {
        comment = await DatabaseService.submitComment(servicePageId, user.id, newComment);
      }
      
      if (comment) {
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      setError('Failed to submit comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-6">Comments</h3>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <img 
                src={user.avatarUrl || 'https://ui-avatars.com/api/?name=' + user.name} 
                alt={user.name} 
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <div className="mt-2 text-right">
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isLoading ? 'Posting...' : 'Post Comment'}
              </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-gray-600">Please <a href="/login" className="text-blue-600 hover:underline">log in</a> to leave a comment.</p>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-6">
        {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={comment.user_profiles.avatar_url || `https://ui-avatars.com/api/?name=${comment.user_profiles.full_name}`} 
                  alt={comment.user_profiles.full_name} 
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="flex-grow">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{comment.user_profiles.full_name}</h4>
                    <span className="text-sm text-gray-500">{formatRelativeTime(comment.created_at)}</span>
                </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
        ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentSection;
