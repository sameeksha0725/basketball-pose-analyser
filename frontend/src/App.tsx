import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Box,
  Tab,
  Tabs,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import {
  SportsTennis,
  Analytics,
  Timeline,
  Upload,
} from '@mui/icons-material';

import FileUpload from './components/FileUpload';
import PoseAnalysis from './components/PoseAnalysis';
import PlayerProgress from './components/PlayerProgress';
import VideoAnalysis from './components/VideoAnalysis';

// Custom theme for basketball app
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35', // Basketball orange
    },
    secondary: {
      main: '#004D9F', // Court blue
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileUpload = (filename: string) => {
    setUploadedFile(filename);
    setActiveTab(1); // Switch to analysis tab
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <SportsTennis sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Basketball Pose Analyser
          </Typography>
          <Typography variant="body2">
            AI-Powered Pose Analysis & Training
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Hero Section */}
        <Paper elevation={1} sx={{ p: 4, mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
            Advanced Basketball Pose Analysis
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
            Transformer-based AI for precise technique evaluation and player development
          </Typography>
        </Paper>

        {/* Main Navigation */}
        <Paper elevation={1} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab icon={<Upload />} label="Upload Media" />
            <Tab icon={<Analytics />} label="Pose Analysis" />
            <Tab icon={<Timeline />} label="Video Analysis" />
            <Tab icon={<SportsTennis />} label="Player Progress" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <FileUpload onFileUpload={handleFileUpload} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PoseAnalysis
            uploadedFile={uploadedFile}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <VideoAnalysis
            uploadedFile={uploadedFile}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <PlayerProgress analysisResult={analysisResult} />
        </TabPanel>

        {/* Features Overview */}
        <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Card elevation={2} sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Top-Down Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Global body structure evaluation using advanced Transformer attention mechanisms
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Bottom-Up Motion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Joint-level coordination analysis for precise movement assessment
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2} sx={{ flex: 1 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsTennis sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Progress Tracking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Continuous player development monitoring with actionable feedback
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
