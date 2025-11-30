import React, { useState, useEffect } from 'react';
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
  Analytics,
  PlayArrow,
  CheckCircle,
  Warning,
  TrendingUp,
  ExpandMore,
  SportsTennis,
} from '@mui/icons-material';
import axios from 'axios';

interface PoseAnalysisProps {
  uploadedFile: string | null;
  onAnalysisComplete: (result: any) => void;
}

const PoseAnalysis: React.FC<PoseAnalysisProps> = ({
  uploadedFile,
  onAnalysisComplete,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = async () => {
    if (!uploadedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/pose/analyze-image/${uploadedFile}`
      );

      setResult(response.data);
      onAnalysisComplete(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score > 0.8) return 'success';
    if (score > 0.6) return 'warning';
    return 'error';
  };

  const getQualityIcon = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'excellent':
        return <CheckCircle color="success" />;
      case 'good':
        return <TrendingUp color="warning" />;
      default:
        return <Warning color="error" />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Analytics sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5">Pose Analysis</Typography>
        </Box>

        {!uploadedFile ? (
          <Alert severity="info">
            Please upload an image first to begin analysis.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Ready to analyze: <strong>{uploadedFile}</strong>
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={analyzing ? undefined : <PlayArrow />}
              onClick={analyzeFile}
              disabled={analyzing}
              sx={{ mt: 2 }}
            >
              {analyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>

            {analyzing && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Running Transformer-based pose analysis...
                </Typography>
                <LinearProgress />
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
          {/* Main Results and Feedback Row */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Main Results */}
            <Box sx={{ flex: 1 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detected Pose
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SportsTennis sx={{ mr: 2, color: 'primary.main' }} />
                    <Chip
                      label={result.analysis.top_down_prediction?.class || 'Unknown'}
                      color="primary"
                      size="medium"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Confidence: {Math.round((result.analysis.top_down_prediction?.confidence || 0) * 100)}%
                  </Typography>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Quality Assessment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getQualityIcon(result.analysis.analysis?.quality_assessment?.rating || 'Unknown')}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {result.analysis.analysis?.quality_assessment?.rating || 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={(result.analysis.quality_score || 0) * 100}
                    color={getQualityColor(result.analysis.quality_score || 0)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Score: {Math.round((result.analysis.quality_score || 0) * 100)}/100
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Feedback */}
            <Box sx={{ flex: 1 }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analysis Feedback
                  </Typography>

                  {result.analysis.analysis?.feedback && (
                    <Box>
                      {/* Strengths */}
                      {result.analysis.analysis.feedback.strengths?.length > 0 && (
                        <Accordion defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                              <Typography variant="subtitle1">Strengths</Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {result.analysis.analysis.feedback.strengths.map((strength: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <CheckCircle color="success" />
                                  </ListItemIcon>
                                  <ListItemText primary={strength} />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {/* Improvements */}
                      {result.analysis.analysis.feedback.improvements?.length > 0 && (
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Warning sx={{ mr: 1, color: 'warning.main' }} />
                              <Typography variant="subtitle1">Areas for Improvement</Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {result.analysis.analysis.feedback.improvements.map((improvement: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <Warning color="warning" />
                                  </ListItemIcon>
                                  <ListItemText primary={improvement} />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {/* Technique Tips */}
                      {result.analysis.analysis.feedback.technique_tips?.length > 0 && (
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
                              <Typography variant="subtitle1">Technique Tips</Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List dense>
                              {result.analysis.analysis.feedback.technique_tips.map((tip: string, index: number) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <TrendingUp color="info" />
                                  </ListItemIcon>
                                  <ListItemText primary={tip} />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Pose Metrics */}
          {result.analysis.analysis?.pose_metrics && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pose Metrics
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  '& > *': { flex: { xs: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }
                }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Balance Ratio
                    </Typography>
                    <Typography variant="h6">
                      {result.analysis.analysis.pose_metrics.balance_ratio?.toFixed(2) || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Torso Angle
                    </Typography>
                    <Typography variant="h6">
                      {result.analysis.analysis.pose_metrics.torso_angle?.toFixed(1) || 'N/A'}°
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Body Symmetry
                    </Typography>
                    <Typography variant="h6">
                      {result.analysis.analysis.pose_metrics.body_symmetry?.toFixed(3) || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Shoulder Width
                    </Typography>
                    <Typography variant="h6">
                      {result.analysis.analysis.pose_metrics.shoulder_width?.toFixed(3) || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Important Joints */}
          {result.analysis.analysis?.important_joints && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Focus Areas (High Attention)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {result.analysis.analysis.important_joints.map((joint: string, index: number) => (
                    <Chip
                      key={index}
                      label={joint.replace(/_/g, ' ').toUpperCase()}
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default PoseAnalysis;
