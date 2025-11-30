import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Remove,
  SportsTennis,
  Analytics,
  Person,
  Timeline,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface PlayerProgressProps {
  analysisResult: any;
}

const PlayerProgress: React.FC<PlayerProgressProps> = ({ analysisResult }) => {
  const [playerId, setPlayerId] = useState('player_001');
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock progress data for demo
  const mockProgressData = useMemo(() => ({
    player_id: playerId,
    total_sessions: 15,
    improvement_trend: 'improving',
    average_pose_quality: 0.78,
    recent_analyses: [
      { date: '2024-12-01', pose: 'shooting', quality: 0.85, session_id: 'session_15' },
      { date: '2024-11-29', pose: 'dribbling', quality: 0.72, session_id: 'session_14' },
      { date: '2024-11-27', pose: 'defensive_stance', quality: 0.81, session_id: 'session_13' },
      { date: '2024-11-25', pose: 'layup', quality: 0.77, session_id: 'session_12' },
      { date: '2024-11-23', pose: 'jump_shot', quality: 0.83, session_id: 'session_11' },
    ],
    recommendations: [
      'Focus on consistent shooting form',
      'Improve defensive stance stability',
      'Work on dribbling rhythm consistency',
      'Enhance overall body balance'
    ],
    pose_distribution: [
      { pose: 'Shooting', sessions: 5, percentage: 33 },
      { pose: 'Dribbling', sessions: 3, percentage: 20 },
      { pose: 'Defense', sessions: 2, percentage: 13 },
      { pose: 'Layup', sessions: 2, percentage: 13 },
      { pose: 'Jump Shot', sessions: 2, percentage: 13 },
      { pose: 'Other', sessions: 1, percentage: 7 },
    ],
    quality_over_time: [
      { session: 1, quality: 0.65, date: '2024-10-01' },
      { session: 2, quality: 0.68, date: '2024-10-03' },
      { session: 3, quality: 0.71, date: '2024-10-05' },
      { session: 4, quality: 0.69, date: '2024-10-08' },
      { session: 5, quality: 0.74, date: '2024-10-10' },
      { session: 6, quality: 0.76, date: '2024-10-12' },
      { session: 7, quality: 0.72, date: '2024-10-15' },
      { session: 8, quality: 0.78, date: '2024-10-17' },
      { session: 9, quality: 0.75, date: '2024-10-20' },
      { session: 10, quality: 0.81, date: '2024-10-22' },
      { session: 11, quality: 0.83, date: '2024-11-23' },
      { session: 12, quality: 0.77, date: '2024-11-25' },
      { session: 13, quality: 0.81, date: '2024-11-27' },
      { session: 14, quality: 0.72, date: '2024-11-29' },
      { session: 15, quality: 0.85, date: '2024-12-01' },
    ]
  }), []);

  useEffect(() => {
    setProgressData(mockProgressData);
  }, [playerId, mockProgressData]);

  const loadPlayerProgress = async () => {
    setLoading(true);
    // In a real app, this would fetch from the API
    setTimeout(() => {
      setProgressData(mockProgressData);
      setLoading(false);
    }, 1000);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp color="success" />;
      case 'declining':
        return <TrendingDown color="error" />;
      default:
        return <Remove color="warning" />;
    }
  };

  // const getTrendColor = (trend: string) => {
  //   switch (trend) {
  //     case 'improving':
  //       return 'success';
  //     case 'declining':
  //       return 'error';
  //     default:
  //       return 'warning';
  //   }
  // };

  const COLORS = ['#FF6B35', '#004D9F', '#F7931E', '#00BCD4', '#4CAF50', '#9C27B0'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Person sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5">Player Progress Analytics</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={loadPlayerProgress}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load Progress'}
          </Button>
        </Box>
      </Paper>

      {/* Current Session Analysis */}
      {analysisResult && (
        <Alert severity="info">
          <Typography variant="body1" gutterBottom>
            <strong>Latest Analysis Available</strong>
          </Typography>
          <Typography variant="body2">
            Click "Record Session" to add this analysis to the player's progress history.
          </Typography>
        </Alert>
      )}

      {progressData && (
        <>
          {/* Overview Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            '& > *': { flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }
          }}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <SportsTennis sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {progressData.total_sessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sessions
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Analytics sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                  {Math.round(progressData.average_pose_quality * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Quality Score
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Timeline sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {getTrendIcon(progressData.improvement_trend)}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {progressData.improvement_trend.toUpperCase()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Improvement Trend
                </Typography>
              </CardContent>
            </Card>

            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressData.average_pose_quality * 100}
                    color={progressData.average_pose_quality > 0.8 ? 'success' : 'warning'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="h6" gutterBottom>
                  Performance Level
                </Typography>
                <Chip
                  label={progressData.average_pose_quality > 0.8 ? 'Advanced' : 
                         progressData.average_pose_quality > 0.6 ? 'Intermediate' : 'Beginner'}
                  color={progressData.average_pose_quality > 0.8 ? 'success' : 'warning'}
                />
              </CardContent>
            </Card>
          </Box>

          {/* Charts Row */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Progress Chart */}
            <Box sx={{ flex: '2' }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quality Score Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData.quality_over_time}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="session" 
                        label={{ value: 'Session Number', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        domain={[0, 1]}
                        label={{ value: 'Quality Score', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Quality']}
                        labelFormatter={(label) => `Session ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="quality"
                        stroke="#FF6B35"
                        strokeWidth={3}
                        dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>

            {/* Pose Distribution */}
            <Box sx={{ flex: '1' }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Practice Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressData.pose_distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.pose}: ${entry.percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {progressData.pose_distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Recent Sessions */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Training Sessions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Pose Type</TableCell>
                      <TableCell>Quality Score</TableCell>
                      <TableCell>Performance</TableCell>
                      <TableCell>Session ID</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {progressData.recent_analyses.map((session: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{session.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={session.pose.replace(/_/g, ' ').toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {Math.round(session.quality * 100)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={session.quality * 100}
                              color={session.quality > 0.8 ? 'success' : 
                                     session.quality > 0.6 ? 'warning' : 'error'}
                              sx={{ width: 80, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.quality > 0.8 ? 'Excellent' :
                                   session.quality > 0.6 ? 'Good' : 'Needs Work'}
                            size="small"
                            color={session.quality > 0.8 ? 'success' :
                                   session.quality > 0.6 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {session.session_id}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Training Recommendations
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2,
                '& > *': { flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }
              }}>
                {progressData.recommendations.map((recommendation: string, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body2">
                      {recommendation}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default PlayerProgress;
