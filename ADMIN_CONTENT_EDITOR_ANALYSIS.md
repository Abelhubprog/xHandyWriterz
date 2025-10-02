# Admin Content Editor Analysis - ArticleEditor Component

## URL: http://localhost:5173/admin/content/new

**Date:** October 1, 2025  
**Component:** `ArticleEditor.tsx` (750 lines)  
**Status:** ⚠️ **PARTIALLY CORRECT** - Has Strapi + Clerk, but **missing** Mattermost & embedded email

---

## ✅ What's Working Correctly

### 1. **Strapi 5 CMS Integration** ✅
**Location:** `apps/web/src/lib/cms-client.ts`

```typescript
class CMSClient {
  private client: GraphQLClient;
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:1337';
    this.token = import.meta.env.VITE_CMS_TOKEN || null;

    this.client = new GraphQLClient(`${this.baseUrl}/graphql`, {
      headers: this.token ? {
        Authorization: `Bearer ${this.token}`,
      } : {},
    });
  }
```

**What It Does:**
- ✅ Connects to Strapi GraphQL API at `http://localhost:1337/graphql`
- ✅ Uses authentication token from `VITE_CMS_TOKEN`
- ✅ Supports full CRUD operations (Create, Read, Update, Delete)
- ✅ Handles articles, services, media uploads
- ✅ Manages SEO metadata, categories, tags

**GraphQL Operations:**
```typescript
// ArticleEditor.tsx line 102-130
const loadArticle = async () => {
  setLoading(true);
  try {
    const article = await cmsClient.getArticle(id);
    if (article) {
      const attrs = article.attributes;
      setFormData({
        title: attrs.title || '',
        slug: attrs.slug || '',
        summary: attrs.summary || '',
        content: typeof attrs.content === 'string' 
          ? JSON.parse(attrs.content) 
          : attrs.content || [],
        status: attrs.status || 'draft',
        domain: attrs.domain || '',
        categories: attrs.categories || [],
        tags: attrs.tags || [],
        heroImage: attrs.heroImage?.data?.attributes?.url || '',
        scheduledAt: attrs.scheduledAt || '',
        seo: {
          title: attrs.seo?.title || '',
          description: attrs.seo?.description || '',
          keywords: attrs.seo?.keywords || [],
          ogImage: attrs.seo?.ogImage?.data?.attributes?.url || '',
        },
      });
    }
  } catch (error) {
    console.error('Failed to load article:', error);
    toast.error('Failed to load article');
  }
}
```

---

### 2. **Clerk Authentication** ✅
**Location:** `ArticleEditor.tsx` line 24

```typescript
import { useAuth } from '@/hooks/useAuth';

export const ArticleEditor: React.FC = () => {
  const { user, isAdmin, isEditor } = useAuth();
  // ... rest of component
```

**What It Does:**
- ✅ Uses `useAuth()` hook to get current user
- ✅ Checks `isAdmin` and `isEditor` roles via Clerk publicMetadata
- ✅ Protects admin routes (must have `role: "admin"` in Clerk)
- ✅ Provides user context for content authorship

**Role Checking:**
```typescript
// In AdminDashboard.tsx (parent component)
const { isAdmin, isEditor } = useAuth();

if (!isAdmin && !isEditor) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
      <p>You need admin or editor privileges to access this page.</p>
    </div>
  );
}
```

---

### 3. **Rich Content Editor** ✅
**Location:** `apps/web/src/components/editor/RichEditor.tsx` (543 lines)

**Features:**
- ✅ Block-based content editor (headings, paragraphs, code, quotes, lists)
- ✅ Media embedding (images, videos, audio)
- ✅ Tables and advanced formatting
- ✅ Code syntax highlighting with language selection
- ✅ Font selection (11 professional fonts)
- ✅ Font size adjustment
- ✅ Real-time preview
- ✅ Auto-save functionality (every 5 seconds)

```typescript
// ArticleEditor.tsx line 138-146
// Auto-save functionality
useEffect(() => {
  if (!hasChanges || !autoSaveEnabled || !isEditing) return;

  const autoSaveTimer = setTimeout(() => {
    handleSave(true);
  }, 5000);

  return () => clearTimeout(autoSaveTimer);
}, [formData, hasChanges, autoSaveEnabled, isEditing]);
```

---

### 4. **SEO Management** ✅
**Features:**
- ✅ SEO title customization
- ✅ Meta description (character count)
- ✅ Keywords tagging
- ✅ OpenGraph image upload
- ✅ URL slug auto-generation from title

```typescript
// ArticleEditor.tsx line 652-708
<Card>
  <CardHeader>
    <CardTitle className="text-lg">SEO Settings</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div>
      <Label htmlFor="seoTitle">SEO Title</Label>
      <Input
        id="seoTitle"
        value={formData.seo.title}
        onChange={(e) => handleSeoChange('title', e.target.value)}
        placeholder={formData.title || 'SEO title...'}
      />
    </div>
    
    <div>
      <Label htmlFor="seoDescription">Meta Description</Label>
      <Textarea
        id="seoDescription"
        value={formData.seo.description}
        onChange={(e) => handleSeoChange('description', e.target.value)}
        placeholder={formData.summary || 'Meta description...'}
        rows={3}
      />
    </div>
    
    <div>
      <Label>Keywords</Label>
      {/* Keyword tags with add/remove functionality */}
    </div>
  </CardContent>
</Card>
```

---

### 5. **Publication Workflow** ✅
**Features:**
- ✅ Draft status management
- ✅ Review workflow
- ✅ Scheduled publishing (set `scheduledAt` timestamp)
- ✅ Published state
- ✅ Archived state

```typescript
const ARTICLE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'review', label: 'Under Review', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'red' },
];
```

---

### 6. **Media Upload** ✅
**Integration:** Uploads to Strapi → R2 bucket

```typescript
// ArticleEditor.tsx line 195-210
const handleImageUpload = async (file: File, field: 'heroImage' | 'ogImage') => {
  try {
    const result = await uploadMedia(file, {
      alt: formData.title,
      folder: `articles/${formData.domain}`,
    });

    if (result?.url) {
      if (field === 'heroImage') {
        handleInputChange('heroImage', result.url);
      } else {
        handleSeoChange('ogImage', result.url);
      }
      toast.success('Image uploaded successfully');
    }
  } catch (error) {
    console.error('Upload failed:', error);
    toast.error('Failed to upload image');
  }
};
```

---

## ❌ What's Missing

### 1. **Mattermost Messaging Integration** ❌

**Expected:** Direct messaging/collaboration within content editor  
**Current Status:** Only a placeholder "collaboration" toggle

```typescript
// ArticleEditor.tsx line 86 - Just a state variable, no actual integration
const [collaborationEnabled, setCollaborationEnabled] = useState(true);

// Line 730-738 - Just a toggle switch, no messaging implementation
<div className="flex items-center justify-between">
  <Label htmlFor="collaboration" className="text-sm font-medium">
    Collaboration
  </Label>
  <Switch
    id="collaboration"
    checked={collaborationEnabled}
    onCheckedChange={setCollaborationEnabled}
  />
</div>
```

**What Should Be There:**
```typescript
// Expected integration (NOT PRESENT):
import { useMattermostClient } from '@/hooks/useMattermost';
import { MessageThread } from '@/components/Messaging/MessageThread';

// Should have:
const { 
  sendMessage, 
  getChannelMessages, 
  createContentChannel 
} = useMattermostClient();

// Should render:
{collaborationEnabled && (
  <Card>
    <CardHeader>
      <CardTitle>Team Discussion</CardTitle>
    </CardHeader>
    <CardContent>
      <MessageThread 
        channelId={contentChannelId}
        context={{ articleId: id, title: formData.title }}
      />
    </CardContent>
  </Card>
)}
```

---

### 2. **Embedded Email Functionality** ❌

**Expected:** Email composition/sending within editor  
**Current Status:** No email functionality at all

**What Should Be There:**
```typescript
// Expected (NOT PRESENT):
import { EmailComposer } from '@/components/Email/EmailComposer';

// Should have a button/tab for email:
<Button
  onClick={() => setShowEmailComposer(true)}
  variant="outline"
>
  <Mail className="h-4 w-4 mr-2" />
  Email Article
</Button>

// Should render modal:
{showEmailComposer && (
  <EmailComposer
    subject={formData.title}
    content={generateEmailFromContent(formData.content)}
    attachments={[formData.heroImage]}
    onSend={handleEmailSend}
    onClose={() => setShowEmailComposer(false)}
  />
)}
```

---

### 3. **File Sharing via Mattermost** ❌

**Expected:** Attach/share article drafts in Mattermost channels  
**Current Status:** No file sharing integration

**What Should Be There:**
```typescript
// Expected (NOT PRESENT):
const shareToMattermost = async () => {
  try {
    const previewUrl = generatePreviewUrl(id);
    await mattermostClient.createPost({
      channelId: teamChannelId,
      message: `📝 New article draft: "${formData.title}"`,
      props: {
        attachments: [{
          pretext: formData.summary,
          title: formData.title,
          title_link: previewUrl,
          text: formData.summary,
          author_name: user?.fullName,
          author_icon: user?.imageUrl,
        }]
      }
    });
    toast.success('Shared to team channel');
  } catch (error) {
    toast.error('Failed to share');
  }
};

// Should have share button:
<Button onClick={shareToMattermost}>
  <Share2 className="h-4 w-4 mr-2" />
  Share to Team
</Button>
```

---

## 🔧 What Needs To Be Added

### **Priority 1: Mattermost Integration**

#### Step 1: Create Mattermost Hook
**File:** `apps/web/src/hooks/useMattermost.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useMattermostClient = () => {
  const { user } = useAuth();
  const baseUrl = import.meta.env.VITE_MATTERMOST_URL;
  const [channelId, setChannelId] = useState<string | null>(null);

  const createContentChannel = async (articleId: string, title: string) => {
    const response = await fetch(`${baseUrl}/api/v4/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.mattermostToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        team_id: 'team-id',
        name: `article-${articleId}`,
        display_name: `Article: ${title}`,
        type: 'P', // Private channel
        purpose: 'Content collaboration',
      }),
    });
    const channel = await response.json();
    setChannelId(channel.id);
    return channel;
  };

  const sendMessage = async (message: string, channelId: string) => {
    await fetch(`${baseUrl}/api/v4/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.mattermostToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel_id: channelId,
        message,
      }),
    });
  };

  const getChannelMessages = async (channelId: string) => {
    const response = await fetch(
      `${baseUrl}/api/v4/channels/${channelId}/posts`,
      {
        headers: {
          'Authorization': `Bearer ${user.mattermostToken}`,
        },
      }
    );
    return response.json();
  };

  return {
    channelId,
    createContentChannel,
    sendMessage,
    getChannelMessages,
  };
};
```

#### Step 2: Add Message Thread Component
**File:** `apps/web/src/components/Messaging/MessageThread.tsx` (NEW)

```typescript
import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMattermostClient } from '@/hooks/useMattermost';

interface MessageThreadProps {
  channelId: string;
  context?: {
    articleId?: string;
    title?: string;
  };
}

export const MessageThread: React.FC<MessageThreadProps> = ({ 
  channelId, 
  context 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendMessage, getChannelMessages } = useMattermostClient();

  useEffect(() => {
    const loadMessages = async () => {
      if (channelId) {
        const data = await getChannelMessages(channelId);
        setMessages(data.posts || []);
      }
    };
    loadMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [channelId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      await sendMessage(newMessage, channelId);
      setNewMessage('');
      // Reload messages
      const data = await getChannelMessages(channelId);
      setMessages(data.posts || []);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg: any) => (
          <div key={msg.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <div className="font-semibold text-sm">{msg.user?.username}</div>
            <div className="text-sm">{msg.message}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.create_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
```

#### Step 3: Integrate into ArticleEditor
**File:** `apps/web/src/pages/admin/ArticleEditor.tsx`

**Add imports:**
```typescript
import { useMattermostClient } from '@/hooks/useMattermost';
import { MessageThread } from '@/components/Messaging/MessageThread';
```

**Add state and hooks:**
```typescript
const { channelId, createContentChannel } = useMattermostClient();
const [showCollaboration, setShowCollaboration] = useState(false);

// Create channel when editing article
useEffect(() => {
  if (isEditing && id && collaborationEnabled) {
    createContentChannel(id, formData.title);
  }
}, [isEditing, id, collaborationEnabled, formData.title]);
```

**Add collaboration panel to sidebar (after line 740):**
```typescript
{/* Collaboration Panel */}
{collaborationEnabled && channelId && (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center">
        <MessageSquare className="h-4 w-4 mr-2" />
        Team Discussion
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-96 border rounded-lg p-4">
        <MessageThread 
          channelId={channelId}
          context={{ articleId: id, title: formData.title }}
        />
      </div>
    </CardContent>
  </Card>
)}
```

---

### **Priority 2: Email Integration**

#### Step 1: Create Email Composer
**File:** `apps/web/src/components/Email/EmailComposer.tsx` (NEW)

```typescript
import React, { useState } from 'react';
import { X, Send, Paperclip, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmailComposerProps {
  subject: string;
  content: string;
  attachments?: string[];
  onSend: (email: {
    to: string[];
    subject: string;
    body: string;
    attachments: string[];
  }) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  subject,
  content,
  attachments = [],
  onSend,
  onClose,
  isOpen,
}) => {
  const [to, setTo] = useState('');
  const [emailSubject, setEmailSubject] = useState(subject);
  const [emailBody, setEmailBody] = useState(content);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      const recipients = to.split(',').map(e => e.trim()).filter(Boolean);
      await onSend({
        to: recipients,
        subject: emailSubject,
        body: emailBody,
        attachments,
      });
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Email Article</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">To</label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@example.com, another@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              className="mt-1"
            />
          </div>

          {attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium">Attachments</label>
              <div className="mt-1 space-y-1">
                {attachments.map((url, i) => (
                  <div key={i} className="flex items-center text-sm">
                    <Paperclip className="h-3 w-3 mr-1" />
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

#### Step 2: Add Email Button to ArticleEditor
**In ArticleEditor.tsx header (after line 397):**

```typescript
<Button
  variant="outline"
  onClick={() => setShowEmailComposer(true)}
>
  <Send className="h-4 w-4 mr-2" />
  Email
</Button>
```

**Add state and modal:**
```typescript
const [showEmailComposer, setShowEmailComposer] = useState(false);

const handleEmailSend = async (email: any) => {
  try {
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    toast.success('Email sent successfully');
  } catch (error) {
    toast.error('Failed to send email');
  }
};

// Add to return statement
<EmailComposer
  isOpen={showEmailComposer}
  onClose={() => setShowEmailComposer(false)}
  subject={formData.title}
  content={formData.summary}
  attachments={formData.heroImage ? [formData.heroImage] : []}
  onSend={handleEmailSend}
/>
```

---

## 📋 Implementation Checklist

### **Phase 1: Mattermost Messaging** (2-3 hours)
- [ ] Create `useMattermostClient` hook
- [ ] Create `MessageThread` component
- [ ] Add Mattermost API endpoints to environment
- [ ] Integrate message thread into ArticleEditor sidebar
- [ ] Test channel creation when editing article
- [ ] Test sending/receiving messages
- [ ] Add real-time WebSocket updates (optional enhancement)

### **Phase 2: Email Functionality** (1-2 hours)
- [ ] Create `EmailComposer` component
- [ ] Add email send API endpoint (`/api/email/send`)
- [ ] Integrate email button into ArticleEditor header
- [ ] Test email composition with article content
- [ ] Test attachment handling
- [ ] Add email templates for better formatting

### **Phase 3: File Sharing** (1 hour)
- [ ] Add "Share to Mattermost" button
- [ ] Implement preview URL generation
- [ ] Format Mattermost attachment cards
- [ ] Test sharing draft articles to team channels

---

## 🎯 Summary

### What You Have ✅
1. **Strapi 5 CMS** - Full GraphQL integration
2. **Clerk Auth** - Role-based admin access
3. **Rich Editor** - Professional content editing
4. **SEO Tools** - Complete metadata management
5. **Media Upload** - R2-backed file storage
6. **Auto-save** - Never lose work

### What's Missing ❌
1. **Mattermost Integration** - No messaging/collaboration
2. **Email Functionality** - No email composer
3. **File Sharing** - Can't share drafts to channels

### Current Reality
The `/admin/content/new` page is a **Strapi 5-based content editor with Clerk authentication**, but it does NOT have Mattermost messaging or email capabilities integrated yet. The "collaboration" toggle is just a placeholder - there's no actual messaging implementation behind it.

**Bottom Line:** You have a solid CMS foundation, but the messaging and email features need to be built following the implementation plan above.

---

Would you like me to start implementing the Mattermost integration first?
