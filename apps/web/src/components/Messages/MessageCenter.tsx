import React, { useState, useEffect, FormEvent } from 'react';
import { useUser } from '@clerk/clerk-react';
import database from '@/lib/d1Client';
import { toast } from 'react-hot-toast';
import { MessageSquare, Send, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  user_id: string;
  sender_type: 'user' | 'admin' | 'system';
  created_at: string;
  is_read: boolean;
}

export const MessageCenter: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const result = await database
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if ((result as any).error) throw (result as any).error;
        setMessages((result as any).data || []);
      } catch (error) {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // No realtime on D1; poll occasionally in UI if needed
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      const result = await database
        .from('messages')
        .insert({
          user_id: user.id,
          content: newMessage.trim(),
          sender_type: 'user',
          is_read: false
        }) as any;

      if ((result as any)?.error) throw (result as any).error;

      setNewMessage('');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading messages...</p>
        </div>
      ) : messages.length > 0 ? (
        <div className="p-6">
          <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.sender_type === 'user'
                    ? 'bg-blue-100 ml-12'
                    : 'bg-gray-100 mr-12'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
              placeholder="Type your message here..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-4">No messages yet</p>

          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
              placeholder="Send us a message..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;
