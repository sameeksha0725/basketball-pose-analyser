import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface SimpleComponentProps {
  uploadedFile: string | null;
  onAnalysisComplete?: (result: any) => void;
}

const VideoAnalysis: React.FC<SimpleComponentProps> = ({ uploadedFile }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Video Analysis
      </Typography>
      {uploadedFile ? (
        <Alert severity="success">
          Ready to analyze video: {uploadedFile}
        </Alert>
      ) : (
        <Alert severity="info">
          Please upload a video first.
        </Alert>
      )}
    </Box>
  );
};

export default VideoAnalysis;
