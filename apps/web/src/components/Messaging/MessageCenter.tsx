import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Paperclip, RefreshCw, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { mattermostClient, type MattermostChannel, type MattermostFileInfo, type MattermostPost } from '@/lib/mm-client';
import useMMAuth from '@/hooks/mattermost/useMMAuth';
import useMattermostChannels from '@/hooks/mattermost/useMattermostChannels';
import useMattermostTimeline from '@/hooks/mattermost/useMattermostTimeline';

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes)) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
};

const ChannelItem: React.FC<{
  channel: MattermostChannel;
  isActive: boolean;
  onSelect: (channelId: string) => void;
}> = ({ channel, isActive, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(channel.id)}
    className={cn(
      'flex w-full flex-col rounded-md border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      isActive ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/40 hover:bg-muted'
    )}
  >
    <span className="font-medium text-sm">{channel.display_name || channel.name}</span>
    {channel.purpose ? (
      <span className="line-clamp-1 text-xs text-muted-foreground">{channel.purpose}</span>
    ) : null}
  </button>
);

const AttachmentPreview: React.FC<{ file: MattermostFileInfo }> = ({ file }) => {
  const href = `${mattermostClient.apiBaseUrl}/files/${file.id}`;
  const isImage = file.mime_type?.startsWith('image/');
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
    >
      {isImage ? (
        <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-sm border">
          <img src={`${href}/thumbnail`} alt={file.name} className="h-full w-full object-cover" />
        </span>
      ) : (
        <Paperclip className="h-4 w-4" />
      )}
      <span className="truncate" title={file.name}>
        {file.name}
      </span>
      <span className="text-[10px] text-muted-foreground/80">{formatBytes(file.size)}</span>
    </a>
  );
};

const MessageBubble: React.FC<{
  post: MattermostPost;
  author: { username?: string; first_name?: string; last_name?: string; nickname?: string } | undefined;
  isOwn: boolean;
}> = ({ post, author, isOwn }) => {
  const displayName = useMemo(() => {
    if (!author) return 'Unknown user';
    const parts = [author.first_name, author.last_name].filter(Boolean).join(' ');
    return author.nickname || (parts.trim() || author.username || 'Unknown');
  }, [author]);

  const messageLines = useMemo(() => post.message.split(/\n+/g), [post.message]);
  const attachments = post.metadata?.files ?? [];

  return (
    <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {!isOwn && <span className="font-medium text-foreground/90">{displayName}</span>}
        <span>{formatDistanceToNow(post.create_at, { addSuffix: true })}</span>
      </div>
      <div
        className={cn(
          'max-w-[85%] rounded-lg border px-3 py-2 text-sm shadow-sm',
          isOwn ? 'rounded-br-sm border-primary bg-primary text-primary-foreground' : 'rounded-bl-sm border-border bg-background'
        )}
      >
        <div className="space-y-1">
          {messageLines.map((line, idx) => (
            <p key={idx} className={cn('whitespace-pre-wrap break-words', line.trim().startsWith('>') && 'border-l-2 border-primary/40 pl-2 text-muted-foreground')}>
              {line}
            </p>
          ))}
        </div>
        {attachments.length > 0 ? (
          <div className="mt-2 flex flex-col gap-1">
            {attachments.map((file) => (
              <AttachmentPreview key={file.id} file={file} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

interface ComposerProps {
  disabled: boolean;
  onSend: (message: string, fileIds: string[]) => Promise<void>;
  onUpload: (files: File[]) => Promise<MattermostFileInfo[]>;
  onTyping: () => void;
  isSending: boolean;
  isUploading: boolean;
}

const MessageComposer: React.FC<ComposerProps> = ({ disabled, onSend, onUpload, onTyping, isSending, isUploading }) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length) {
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!message.trim() && files.length === 0) {
      toast({ variant: 'destructive', title: 'Message required', description: 'Add a message or at least one attachment.' });
      return;
    }
    try {
      let uploaded: MattermostFileInfo[] = [];
      if (files.length > 0) {
        uploaded = await onUpload(files);
      }
      await onSend(message.trim(), uploaded.map((file) => file.id));
      setMessage('');
      setFiles([]);
      resetFileInput();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Unable to send message', description: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Write a message…"
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending || isUploading}
        rows={3}
        className="resize-none"
      />
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <Badge key={`${file.name}-${index}`} variant="secondary" className="flex items-center gap-2">
              <span className="max-w-[180px] truncate" title={file.name}>
                {file.name}
              </span>
              <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
              <button type="button" className="text-xs text-muted-foreground transition hover:text-destructive" onClick={() => removeFile(index)}>
                ×
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            className="max-w-xs border-dashed"
            onChange={handleFileChange}
            disabled={disabled || isUploading || isSending}
          />
          <span className="text-xs text-muted-foreground">Press Enter to send • Shift + Enter for newline</span>
        </div>
        <Button type="submit" disabled={disabled || isSending || isUploading} className="gap-2">
          {isSending || isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Send</span>
        </Button>
      </div>
    </form>
  );
};

const EmptyState: React.FC<{ message: string; action?: React.ReactNode }> = ({ message, action }) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/40 p-8 text-center text-sm text-muted-foreground">
    <p>{message}</p>
    {action}
  </div>
);

const MessageCenter: React.FC = () => {
  const auth = useMMAuth();
  const { toast } = useToast();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { channels, isLoading: channelsLoading, error: channelsError, refresh: refreshChannels } = useMattermostChannels({ enabled: auth.status === 'ready' });

  useEffect(() => {
    if (auth.status !== 'ready') {
      setSelectedChannelId(null);
      return;
    }
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    } else if (selectedChannelId && !channels.some((channel) => channel.id === selectedChannelId)) {
      setSelectedChannelId(channels[0]?.id ?? null);
    }
  }, [auth.status, channels, selectedChannelId]);

  const timeline = useMattermostTimeline(selectedChannelId, auth.status === 'ready');
  const conversationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationRef.current) return;
    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [timeline.posts.length, selectedChannelId]);

  const typingNames = useMemo(() => {
    const profiles = timeline.typingUserIds
      .map((id) => timeline.userMap[id])
      .filter(
        (profile): profile is { id: string; username: string; first_name?: string; last_name?: string; nickname?: string } =>
          Boolean(profile),
      )
      .filter((profile) => profile.id !== auth.user?.id);

    return profiles.map((user) => user.nickname || [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.username || 'Someone');
  }, [auth.user?.id, timeline.typingUserIds, timeline.userMap]);

  const handleSend = useCallback(
    async (body: string, fileIds: string[]) => {
      try {
        await timeline.sendMessage(body, { fileIds });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Message failed',
          description: error instanceof Error ? error.message : 'Unknown error sending message.',
        });
        throw error;
      }
    },
    [timeline, toast],
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      try {
        return await timeline.uploadFiles(files);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Unknown error uploading files.',
        });
        throw error;
      }
    },
    [timeline, toast],
  );

  if (auth.status === 'disabled') {
    return (
      <Alert className="border-yellow-400 bg-yellow-50 text-yellow-800">
        <AlertTitle>Messaging not configured</AlertTitle>
        <AlertDescription>
          Configure Mattermost environment variables and the mm-auth worker to enable native chat inside the dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (auth.status === 'idle' || auth.status === 'loading') {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 rounded-lg border bg-muted/30">
        <LoadingSpinner size="lg" showText label="Connecting to Mattermost" />
        <p className="text-sm text-muted-foreground">Establishing a secure session…</p>
      </div>
    );
  }

  if (auth.status === 'error') {
    return (
      <Alert variant="destructive" className="space-y-4">
        <div>
          <AlertTitle>Unable to connect to Mattermost</AlertTitle>
          <AlertDescription>
            {auth.error?.message ?? 'We could not create a Mattermost session. Try again or contact support.'}
          </AlertDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => auth.reauthenticate()} className="gap-2 self-start">
          <RefreshCw className="h-4 w-4" /> Retry connection
        </Button>
      </Alert>
    );
  }

  return (
    <div className="flex h-[70vh] flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
        <p className="text-sm text-muted-foreground">Mattermost conversations and files now load natively in the dashboard.</p>
      </div>
      <div className="flex h-full min-h-0 gap-4">
        <aside className="hidden w-64 flex-shrink-0 flex-col rounded-lg border bg-background p-3 lg:flex">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Channels</h3>
            <Button variant="ghost" size="icon" onClick={() => refreshChannels()} disabled={channelsLoading}>
              <RefreshCw className={cn('h-4 w-4', channelsLoading && 'animate-spin')} />
            </Button>
          </div>
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-2 pb-8">
              {channelsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-12 animate-pulse rounded-md bg-muted" />
                  ))}
                </div>
              ) : channelsError ? (
                <EmptyState
                  message="Unable to load channels."
                  action={(
                    <Button size="sm" variant="outline" onClick={() => refreshChannels()}>
                      Retry
                    </Button>
                  )}
                />
              ) : channels.length === 0 ? (
                <EmptyState message="No channels assigned yet. Ask an admin to add you to a team." />
              ) : (
                channels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={channel.id === selectedChannelId}
                    onSelect={setSelectedChannelId}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </aside>
        <section className="flex flex-1 flex-col gap-3 rounded-lg border bg-background p-4">
          {selectedChannelId ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    {channels.find((channel) => channel.id === selectedChannelId)?.display_name ?? 'Channel'}
                  </h3>
                  {typingNames.length > 0 ? (
                    <p className="text-xs text-muted-foreground">{typingNames.join(', ')} typing…</p>
                  ) : null}
                </div>
                <Badge variant="secondary">Last updated {formatDistanceToNow(timeline.dataUpdatedAt || Date.now(), { addSuffix: true })}</Badge>
              </div>
              <div ref={conversationRef} className="flex-1 overflow-y-auto rounded-md bg-muted/30 p-4">
                {timeline.isLoading ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3">
                    <LoadingSpinner />
                    <p className="text-sm text-muted-foreground">Loading conversation…</p>
                  </div>
                ) : timeline.error ? (
                  <EmptyState
                    message="We couldn’t load this conversation."
                    action={(
                      <Button size="sm" variant="outline" onClick={() => timeline.refetch()}>
                        Retry
                      </Button>
                    )}
                  />
                ) : timeline.posts.length === 0 ? (
                  <EmptyState message="No messages yet. Start the conversation with a quick hello!" />
                ) : (
                  <div className="flex flex-col gap-4">
                    {timeline.posts.map((post) => (
                      <MessageBubble
                        key={post.id}
                        post={post}
                        author={timeline.userMap[post.user_id]}
                        isOwn={post.user_id === auth.user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
              <MessageComposer
                disabled={timeline.isLoading || timeline.isFetching}
                onSend={handleSend}
                onUpload={handleUpload}
                onTyping={() => timeline.sendTyping()}
                isSending={timeline.isSending}
                isUploading={timeline.isUploading}
              />
            </>
          ) : (
            <EmptyState message="Select a channel from the sidebar to load messages." />
          )}
        </section>
      </div>
    </div>
  );
};

export default MessageCenter;
