// This file contains TypeScript type declarations for our application

// Document Submission Types
declare interface SubmissionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  status: 'pending' | 'uploaded' | 'failed';
  created_at: string;
}

declare interface DocumentSubmission {
  id: string;
  user_id: string;
  files: SubmissionFile[];
  metadata: Record<string, any>;
  status: 'pending' | 'completed' | 'failed' | 'partial';
  created_at: string;
  updated_at: string;
}

// Queue Types
declare interface QueueItem {
  id: string;
  user_id: string;
  metadata: Record<string, any>;
  status: string;
  attempts: number;
  max_attempts: number;
  last_attempt: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

// Notification Types
declare interface AdminNotification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: string[];
  status: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  metadata: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
} 