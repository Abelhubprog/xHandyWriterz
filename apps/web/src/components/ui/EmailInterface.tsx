import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Separator,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  AppBar,
  Toolbar,
  Badge,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import LoadingState from './LoadingState';
import { motion } from 'framer-motion';

interface Email {
  id: string;
  subject: string;
  body: string;
  attachments: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  from: string;
  to: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reports?: {
    aiScore?: number;
    plagiarismScore?: number;
    aiReportUrl?: string;
    plagiarismReportUrl?: string;
  };
}

const DRAWER_WIDTH = 240;

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function EmailInterface() {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const [composeData, setComposeData] = useState({
    subject: '',
    body: '',
    files: [] as File[]
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setComposeData(prev => ({
        ...prev,
        files: [...prev.files, ...acceptedFiles]
      }));
    }
  });

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails');
      if (!response.ok) throw new Error('Failed to fetch emails');
      
      const data = await response.json();
      setEmails(data.emails);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchEmails();
    }
  }, [session]);

  const handleSend = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('subject', composeData.subject);
      formData.append('body', composeData.body);
      composeData.files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to send email');

      await fetchEmails();
      setComposeOpen(false);
      setComposeData({
        subject: '',
        body: '',
        files: []
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return;

    try {
      const response = await fetch(`/api/emails/${emailId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete email');

      await fetchEmails();
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  if (!session) {
    return (
      <Alert severity="warning">
        Please sign in to access your emails.
      </Alert>
    );
  }

  return (
    <>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setComposeOpen(true)}
              >
                Compose
              </Button>
            </ListItem>
            <ListItem button selected>
              <ListItemIcon>
                <Badge badgeContent={emails.length} color="primary">
                  <InboxIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SendIcon />
              </ListItemIcon>
              <ListItemText primary="Sent" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <DraftsIcon />
              </ListItemIcon>
              <ListItemText primary="Drafts" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inbox
          </Typography>
          <IconButton onClick={fetchEmails} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>

        <LoadingState
          loading={loading}
          error={error}
          retry={fetchEmails}
          variant="skeleton"
          skeletonType="email"
          skeletonCount={5}
        >
          <Box sx={{ display: 'flex' }}>
            {/* Email list */}
            <Paper sx={{ width: 360, mr: 2 }}>
              <motion.div
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <List>
                  {emails.map((email) => (
                    <motion.div
                      key={email.id}
                      variants={listItemVariants}
                      layout
                    >
                      <ListItem
                        button
                        selected={selectedEmail?.id === email.id}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <ListItemText
                          primary={email.subject}
                          secondary={format(new Date(email.createdAt), 'PPp')}
                        />
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(email.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </motion.div>
            </Paper>

            {/* Email content */}
            {selectedEmail && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ flex: 1 }}
              >
                <Paper sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6">{selectedEmail.subject}</Typography>
                  <Typography variant="caption" display="block" gutterBottom>
                    From: {selectedEmail.from}
                    <br />
                    Date: {format(new Date(selectedEmail.createdAt), 'PPpp')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                    {selectedEmail.body}
                  </Typography>
                  {selectedEmail.attachments.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments:
                      </Typography>
                      <List>
                        {selectedEmail.attachments.map((attachment, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <AttachFileIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={attachment.name}
                              secondary={`${(attachment.size / 1024 / 1024).toFixed(2)} MB`}
                            />
                            <Button
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  {selectedEmail.reports && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Analysis Results
                      </Typography>
                      <Typography>
                        AI Score: {selectedEmail.reports.aiScore?.toFixed(1)}%
                      </Typography>
                      <Typography>
                        Plagiarism Score: {selectedEmail.reports.plagiarismScore?.toFixed(1)}%
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {selectedEmail.reports.aiReportUrl && (
                          <Button
                            href={selectedEmail.reports.aiReportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mr: 1 }}
                          >
                            View AI Report
                          </Button>
                        )}
                        {selectedEmail.reports.plagiarismReportUrl && (
                          <Button
                            href={selectedEmail.reports.plagiarismReportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Plagiarism Report
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            )}
          </Box>
        </LoadingState>
      </Box>

      {/* Compose dialog */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Compose Email
          <IconButton
            onClick={() => setComposeOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={composeData.subject}
            onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={6}
            value={composeData.body}
            onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            <Typography>
              Drag and drop files here, or click to select files
            </Typography>
          </Box>
          {composeData.files.length > 0 && (
            <List>
              {composeData.files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AttachFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                  <IconButton
                    onClick={() => setComposeData(prev => ({
                      ...prev,
                      files: prev.files.filter((_, i) => i !== index)
                    }))}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={loading || !composeData.subject || !composeData.body}
          >
            {loading ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
