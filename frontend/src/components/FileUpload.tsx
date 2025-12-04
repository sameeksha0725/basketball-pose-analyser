import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Paper,
  Typography,
  Box,
  Button,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Image,
  VideoFile,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

interface FileUploadProps {
  onFileUpload: (filename: string, fileType: 'image' | 'video') => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const isVideo = file.type.startsWith('video/');
      const endpoint = isVideo ? '/upload-video' : '/upload-image';
      
      const response = await axios.post(
        `http://localhost:8000/api/v1/pose${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      setUploadResult(response.data);
      // Pass file type to parent component
      onFileUpload(response.data.filename, isVideo ? 'video' : 'image');
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Box sx={{ flex: { md: 2 } }}>
        <Paper
          {...getRootProps()}
          elevation={2}
          sx={{
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            bgcolor: isDragActive ? 'primary.light' : 'background.paper',
            opacity: isDragActive ? 0.8 : 1,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          
          {uploading ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Uploading...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ mt: 2, width: '100%' }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {uploadProgress}% complete
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                {isDragActive ? 'Drop your file here' : 'Upload Basketball Media'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Drag & drop an image or video, or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports: Images (PNG, JPG) and Videos (MP4, AVI, MOV) up to 50MB
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }}>
                Choose File
              </Button>
            </Box>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {uploadResult && (
          <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
            <Typography variant="body1" gutterBottom>
              File uploaded successfully!
            </Typography>
            <Typography variant="body2">
              Filename: {uploadResult.filename}
            </Typography>
          </Alert>
        )}
      </Box>

      <Box sx={{ flex: { md: 1 } }}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Supported Basketball Poses
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {[
                'Shooting',
                'Dribbling',
                'Defense',
                'Layup',
                'Jump Shot',
                'Free Throw',
                'Passing',
                'Rebounding',
              ].map((pose) => (
                <Chip
                  key={pose}
                  label={pose}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload Tips
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Image sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                Clear view of the player
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <VideoFile sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="body2">
                3-10 second video clips work best
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2">
                Good lighting and minimal background
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default FileUpload;
