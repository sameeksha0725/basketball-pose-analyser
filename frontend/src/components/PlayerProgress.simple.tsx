import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

interface SimpleComponentProps {
  analysisResult?: any;
}

const PlayerProgress: React.FC<SimpleComponentProps> = ({ analysisResult }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Player Progress
      </Typography>
      {analysisResult ? (
        <Alert severity="success">
          Analysis result available for tracking.
        </Alert>
      ) : (
        <Alert severity="info">
          Complete an analysis to start tracking progress.
        </Alert>
      )}
    </Box>
  );
};

export default PlayerProgress;
