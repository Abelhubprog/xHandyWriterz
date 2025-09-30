import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  createdAt: string;
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  onReply: (commentId: string, content: string) => void;
  isAuthenticated: boolean;
}

export function CommentThread({ comments, onReply, isAuthenticated }: CommentThreadProps) {
  const [replyContent, setReplyContent] = React.useState<{ [key: string]: string }>({});

  const handleReply = (commentId: string) => {
    if (replyContent[commentId]) {
      onReply(commentId, replyContent[commentId]);
      setReplyContent((prev) => ({ ...prev, [commentId]: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <Card key={comment.id} className={`ml-${depth * 4}`}>
      <CardHeader className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.imageUrl} alt={`${comment.author.firstName} ${comment.author.lastName}`} />
          <AvatarFallback>
            {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{comment.author.firstName} {comment.author.lastName}</CardTitle>
            <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
          </div>
          <p className="text-sm">{comment.content}</p>
          {isAuthenticated && (
            <div className="flex items-center space-x-2 mt-2">
              <Textarea
                placeholder="Reply..."
                value={replyContent[comment.id] || ''}
                onChange={(e) => setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                className="min-w-0 flex-1"
              />
              <Button
                size="sm"
                onClick={() => handleReply(comment.id)}
                disabled={!replyContent[comment.id]?.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="ml-12 space-y-4">
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {comments.map((comment) => renderComment(comment))}
    </div>
  );
}
