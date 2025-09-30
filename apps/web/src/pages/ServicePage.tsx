import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Share2, ThumbsUp, MessageCircle, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cloudflareDb } from '@/lib/cloudflare';

const ServicePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
    fetchComments();
  }, [slug]);

  const fetchServiceDetails = async () => {
    try {
      const result = await cloudflareDb.query(`
        SELECT * FROM services WHERE slug = ? LIMIT 1
      `, [slug]);

      const data = result.results?.[0];
      if (!data) {
        throw new Error('Service not found');
      }
      setService(data);
    } catch (error) {
      toast.error('Failed to load service details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      if (!service?.id) return;

      const result = await cloudflareDb.query(`
        SELECT * FROM comments
        WHERE service_id = ?
        ORDER BY created_at DESC
      `, [service.id]);

      setComments(result.results || []);
    } catch (error) {
    }
  };

  const handleLike = async () => {
    try {
      if (!service) return;

      const response = await fetch(`/api/services/${service.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Thanks for your feedback!');
        // Refresh service details to update like count
        fetchServiceDetails();
      }
    } catch (error) {
      toast.error('Failed to like service');
    }
  };

  const handleShare = async () => {
    if (!service) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.description,
          url: window.location.href,
        });
        toast.success('Thanks for sharing!');
      } catch (error) {
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(service.title)}&url=${url}`);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !service || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await cloudflareDb.insert('comments', {
        service_id: service.id,
        content: newComment.trim(),
        user_id: user.id,
        created_at: new Date().toISOString()
      });

      toast.success('Comment posted successfully');
      setNewComment('');
      fetchComments();
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Service not found</h1>
        <button
          onClick={() => navigate('/services')}
          className="inline-flex items-center text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Service Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold mb-4">{service.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{service.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  aria-label="Like this service"
                >
                  <ThumbsUp className="h-5 w-5 mr-2" />
                  <span>{service.likes_count || 0}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  aria-label="Share this service"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>

              <button
                onClick={() => navigate('/services')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Services
              </button>
            </div>
          </div>

          {/* Service Content */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: service.content }} />
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Comments</h2>

            {/* Comment Form */}
            {isSignedIn ? (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Post Comment
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <p className="text-gray-600">
                  Please{' '}
                  <button
                    onClick={() => navigate('/sign-in')}
                    className="text-primary hover:underline"
                  >
                    sign in
                  </button>{' '}
                  to leave a comment.
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-4"
                >
                  <img
                    src={comment.avatar_url || '/default-avatar.png'}
                    alt={comment.user_name || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium text-gray-900 mb-1">
                        {comment.user_name || 'Anonymous User'}
                      </p>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}

              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServicePage;
