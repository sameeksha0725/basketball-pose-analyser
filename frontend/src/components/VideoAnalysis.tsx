import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  VideoFile,
  PlayArrow,
  CheckCircle,
  Warning,
  TrendingUp,
  ExpandMore,
  Timeline,
  Speed,
  Waves,
} from '@mui/icons-material';
import axios from 'axios';

interface VideoAnalysisProps {
  uploadedFile: string | null;
  onAnalysisComplete: (result: any) => void;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({
  uploadedFile,
  onAnalysisComplete,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async () => {
    if (!uploadedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/pose/analyze-video/${uploadedFile}`
      );

      setResult(response.data);
      onAnalysisComplete(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Video analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getMotionQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'smooth':
        return 'success';
      case 'moderate':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <VideoFile sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5">Video Motion Analysis</Typography>
        </Box>

        {!uploadedFile ? (
          <Alert severity="info">
            Please upload a video first to begin motion analysis.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Ready to analyze motion patterns in: <strong>{uploadedFile}</strong>
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? undefined : <PlayArrow />}
              onClick={analyzeVideo}
              disabled={analyzing}
              sx={{ mt: 2 }}
            >
              {analyzing ? 'Analyzing Motion...' : 'Start Video Analysis'}
            </Button>

            {analyzing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Processing video frames and analyzing temporal patterns...
                </Typography>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  This may take a few minutes depending on video length
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {result && result.analysis && (
        <>
          {/* Overall Assessment and Motion Quality Row */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Overall Assessment */}
            <Box sx={{ flex: 1 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Overall Assessment
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" gutterBottom>
                      {result.analysis.feedback?.overall_assessment || 'Analysis complete'}
                    </Typography>
                  </Box>

                  {result.analysis.overall_prediction && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Primary Motion Pattern
                      </Typography>
                      <Chip
                        label={result.analysis.overall_prediction.top_down_class}
                        color="primary"
                        size="medium"
                      />
                    </Box>
                  )}

                  {result.analysis.sequence_length && (
                    <Typography variant="body2" color="text.secondary">
                      Analyzed {result.analysis.sequence_length} frames
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Motion Quality Metrics */}
            <Box sx={{ flex: 1 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Motion Quality Metrics
                  </Typography>

                  {result.analysis.motion_analysis && (
                    <Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Waves sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle2">Motion Quality</Typography>
                        </Box>
                        <Chip
                          label={result.analysis.motion_analysis.motion_quality}
                          color={getMotionQualityColor(result.analysis.motion_analysis.motion_quality)}
                          variant="outlined"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Speed sx={{ mr: 1, color: 'secondary.main' }} />
                          <Typography variant="subtitle2">Smoothness Score</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={result.analysis.motion_analysis.smoothness_score * 100}
                          color={result.analysis.motion_analysis.smoothness_score > 0.7 ? 'success' : 'warning'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(result.analysis.motion_analysis.smoothness_score * 100)}%
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Timeline sx={{ mr: 1, color: 'info.main' }} />
                          <Typography variant="subtitle2">Rhythm Consistency</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={result.analysis.motion_analysis.rhythm_consistency * 100}
                          color={result.analysis.motion_analysis.rhythm_consistency > 0.7 ? 'success' : 'warning'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(result.analysis.motion_analysis.rhythm_consistency * 100)}%
                        </Typography>
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 2, 
                        mt: 2,
                        '& > *': { flex: '1 1 calc(50% - 8px)', minWidth: '120px' }
                      }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Avg Velocity
                          </Typography>
                          <Typography variant="h6">
                            {result.analysis.motion_analysis.average_velocity?.toFixed(4) || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Max Velocity
                          </Typography>
                          <Typography variant="h6">
                            {result.analysis.motion_analysis.max_velocity?.toFixed(4) || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Detailed Feedback */}
          {result.analysis.feedback && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Motion Analysis Feedback
                </Typography>

                {/* Key Observations */}
                {result.analysis.feedback.key_observations?.length > 0 && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                        <Typography variant="subtitle1">Key Observations</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {result.analysis.feedback.key_observations.map((observation: string, index: number) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText primary={observation} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Improvement Areas */}
                {result.analysis.feedback.improvement_areas?.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Warning sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="subtitle1">Areas for Improvement</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {result.analysis.feedback.improvement_areas.map((area: string, index: number) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Warning color="warning" />
                            </ListItemIcon>
                            <ListItemText primary={area} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Recommended Drills */}
                {result.analysis.feedback.drills_recommended?.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="subtitle1">Recommended Drills</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {result.analysis.feedback.drills_recommended.map((drill: string, index: number) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <TrendingUp color="info" />
                            </ListItemIcon>
                            <ListItemText primary={drill} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default VideoAnalysis;
