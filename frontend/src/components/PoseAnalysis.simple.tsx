import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface SimpleComponentProps {
  uploadedFile: string | null;
  onAnalysisComplete?: (result: any) => void;
}

const PoseAnalysis: React.FC<SimpleComponentProps> = ({ uploadedFile }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pose Analysis
      </Typography>
      {uploadedFile ? (
        <Alert severity="success">
          Ready to analyze: {uploadedFile}
        </Alert>
      ) : (
        <Alert severity="info">
          Please upload a file first.
        </Alert>
      )}
    </Box>
  );
};

export default PoseAnalysis;
