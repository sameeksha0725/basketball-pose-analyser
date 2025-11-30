import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 300000, // 5 minutes for video analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface UploadResponse {
  filename: string;
  file_path: string;
  file_size: number;
  upload_time: string;
}

export interface AnalysisResponse {
  success: boolean;
  filename: string;
  analysis: any;
}

export interface PlayerProgressResponse {
  player_id: string;
  total_sessions: number;
  improvement_trend: string;
  average_pose_quality: number;
  recent_analyses: any[];
  recommendations: string[];
}

export const poseAnalysisAPI = {
  // File upload endpoints
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/pose/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  uploadVideo: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/pose/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    
    return response.data;
  },

  // Analysis endpoints
  analyzeImage: async (filename: string): Promise<AnalysisResponse> => {
    const response = await apiClient.post(`/pose/analyze-image/${filename}`);
    return response.data;
  },

  analyzeVideo: async (filename: string): Promise<AnalysisResponse> => {
    const response = await apiClient.post(`/pose/analyze-video/${filename}`);
    return response.data;
  },

  // Utility endpoints
  getPoseClasses: async (): Promise<{ pose_classes: string[], total_classes: number }> => {
    const response = await apiClient.get('/pose/pose-classes');
    return response.data;
  },

  getAnalysisHistory: async (limit: number = 10): Promise<any> => {
    const response = await apiClient.get(`/pose/analysis-history?limit=${limit}`);
    return response.data;
  },

  // Player progress endpoints
  trackPlayerProgress: async (playerId: string, analysisData: any): Promise<any> => {
    const response = await apiClient.post('/pose/player-progress', {
      player_id: playerId,
      analysis_data: analysisData,
    });
    return response.data;
  },

  getPlayerProgress: async (playerId: string): Promise<PlayerProgressResponse> => {
    const response = await apiClient.get(`/pose/player-progress/${playerId}`);
    return response.data;
  },

  // Cleanup
  cleanupFile: async (filename: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/pose/cleanup/${filename}`);
    return response.data;
  },
};

export default apiClient;
