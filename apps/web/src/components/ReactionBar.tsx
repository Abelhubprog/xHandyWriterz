import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ReactionBarProps {
  postId: string;
  reactions: {
    likes: number;
    bookmarks: number;
    shares: number;
  };
  onReactionToggle: (type: 'like' | 'bookmark' | 'share') => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export function ReactionBar({ postId, reactions, onReactionToggle, isLiked = false, isBookmarked = false }: ReactionBarProps) {
  const [localLikes, setLocalLikes] = useState(reactions.likes);
  const [localBookmarks, setLocalBookmarks] = useState(reactions.bookmarks);

  const handleLike = () => {
    onReactionToggle('like');
    setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1);
  };

  const handleBookmark = () => {
    onReactionToggle('bookmark');
    setLocalBookmarks(isBookmarked ? localBookmarks - 1 : localBookmarks + 1);
  };

  const handleShare = () => {
    onReactionToggle('share');
    // Share logic can be implemented here, e.g., navigator.share
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: window.location.href,
      });
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 border-t bg-muted/50">
      <Button
        variant={isLiked ? 'default' : 'ghost'}
        size="sm"
        onClick={handleLike}
        className="flex items-center space-x-1"
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
        <span className="text-sm">{localLikes}</span>
      </Button>
      <Button
        variant={isBookmarked ? 'default' : 'ghost'}
        size="sm"
        onClick={handleBookmark}
        className="flex items-center space-x-1"
        aria-label={isBookmarked ? 'Unbookmark post' : 'Bookmark post'}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        <span className="text-sm">{localBookmarks}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="flex items-center space-x-1"
        aria-label="Share post"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm">{reactions.shares}</span>
      </Button>
    </div>
  );
}
