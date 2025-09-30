import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Button,
  Link
} from '@mui/material';
import { TelegramInteractionStep } from '@/services/telegramBotInteractionService';
import { useInterval } from '@/hooks/useInterval';

interface DocumentProcessingStatusProps {
  requestId: string;
  onComplete?: () => void;
}

interface ProcessingStatus {
  status: string;
  telegramStatus: string;
  step: TelegramInteractionStep;
  error?: string;
  reports?: {
    aiReportUrl?: string;
    plagiarismReportUrl?: string;
    aiScore?: number;
    plagiarismScore?: number;
  };
}

const steps = [
  'Document Uploaded',
  'Region Selection',
  'Initial Questions',
  'Processing Document',
  'Generating Reports'
];

export default function DocumentProcessingStatus({
  requestId,
  onComplete
}: DocumentProcessingStatusProps) {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/documents/${requestId}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');

      const data = await response.json();
      setStatus(data);

      if (data.status === 'COMPLETED' && onComplete) {
        onComplete();
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Poll status every 5 seconds if not completed or failed
  useInterval(
    fetchStatus,
    status?.status !== 'COMPLETED' && status?.status !== 'FAILED' ? 5000 : null
  );

  useEffect(() => {
    fetchStatus();
  }, [requestId]);

  const getActiveStep = () => {
    if (!status) return 0;

    switch (status.step) {
      case TelegramInteractionStep.DOCUMENT_SENT:
        return 0;
      case TelegramInteractionStep.REGION_SELECTION:
        return 1;
      case TelegramInteractionStep.QUESTION_ONE:
      case TelegramInteractionStep.QUESTION_TWO:
        return 2;
      case TelegramInteractionStep.PROCESSING:
        return 3;
      case TelegramInteractionStep.COMPLETED:
        return 4;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchStatus}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert severity="error">
        Request not found
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Document Processing Status
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Request ID: {requestId}
          </Typography>
        </Box>

        <Stepper activeStep={getActiveStep()} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {status.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {status.error}
          </Alert>
        )}

        {status.status === 'COMPLETED' && status.reports && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                AI Score: {status.reports.aiScore?.toFixed(1)}%
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Plagiarism Score: {status.reports.plagiarismScore?.toFixed(1)}%
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {status.reports.aiReportUrl && (
                <Button
                  variant="outlined"
                  component={Link}
                  href={status.reports.aiReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View AI Report
                </Button>
              )}
              {status.reports.plagiarismReportUrl && (
                <Button
                  variant="outlined"
                  component={Link}
                  href={status.reports.plagiarismReportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Plagiarism Report
                </Button>
              )}
            </Box>
          </Box>
        )}

        {status.status === 'FAILED' && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchStatus}
            >
              Retry Processing
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
