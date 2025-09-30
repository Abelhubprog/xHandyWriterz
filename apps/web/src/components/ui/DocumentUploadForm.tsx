import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';

interface UploadFormData {
  region: string;
  questionOne: boolean;
  questionTwo: boolean;
  file?: File;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentUploadForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<UploadFormData>({
    region: '',
    questionOne: false,
    questionTwo: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.file) {
        throw new Error('Please select a file to upload.');
      }

      if (!formData.region) {
        throw new Error('Please select a region.');
      }

      // Create form data
      const form = new FormData();
      form.append('file', formData.file);
      form.append('region', formData.region);
      form.append('questionOne', String(formData.questionOne));
      form.append('questionTwo', String(formData.questionTwo));

      // Upload document
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: form
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload document');
      }

      const { requestId } = await response.json();
      setSuccess(`Document uploaded successfully! Request ID: ${requestId}`);
      
      // Reset form
      setFormData({
        region: '',
        questionOne: false,
        questionTwo: false
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Alert severity="warning">
        Please sign in to upload documents.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please provide the required information and upload your document.
            </Typography>
          </Box>

          {/* Region Selection */}
          <Field fullWidth required sx={{ mb: 3 }}>
            <Field.Label>Select Region</Field.Label>
            <Select
              value={formData.region}
              onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
              displayEmpty
            >
              <MenuItem value="">Select a region</MenuItem>
              <MenuItem value="europe">Europe</MenuItem>
              <MenuItem value="asia">Asia</MenuItem>
              <MenuItem value="americas">Americas</MenuItem>
              <MenuItem value="africa">Africa</MenuItem>
              <MenuItem value="oceania">Oceania</MenuItem>
            </Select>
          </Field>

          {/* Question One */}
          <Field component="fieldset" required sx={{ mb: 3 }}>
            <Field.Label>Question 1: Is this an academic document?</Field.Label>
            <RadioGroup
              value={formData.questionOne}
              onChange={(e) => setFormData(prev => ({ ...prev, questionOne: e.target.value === 'true' }))}
            >
              <FieldLabel value="true" control={<Radio />} label="Yes" />
              <FieldLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </Field>

          {/* Question Two */}
          <Field component="fieldset" required sx={{ mb: 3 }}>
            <Field.Label>Question 2: Do you want a detailed analysis?</Field.Label>
            <RadioGroup
              value={formData.questionTwo}
              onChange={(e) => setFormData(prev => ({ ...prev, questionTwo: e.target.value === 'true' }))}
            >
              <FieldLabel value="true" control={<Radio />} label="Yes" />
              <FieldLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </Field>

          {/* File Upload */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              mb: 3,
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            {formData.file ? (
              <Typography>Selected file: {formData.file.name}</Typography>
            ) : (
              <Typography>
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag and drop a file here, or click to select'}
              </Typography>
            )}
            <FormHelperText>
              Supported formats: PDF, DOC, DOCX, TXT (Max size: 10MB)
            </FormHelperText>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !formData.file}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Upload Document'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
