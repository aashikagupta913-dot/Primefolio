import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject active Supabase JWT into header
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified API Service Layer
export const apiService = {
  // Authentication check
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Resumes
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async parseResume(resumeId: string) {
    const response = await api.post('/resume/parse', { resume_id: resumeId });
    return response.data;
  },

  // Portfolios
  async generatePortfolio(resumeId: string, themeSlug?: string, mode: string = 'template', subdomain?: string, userInstructions?: string) {
    const response = await api.post('/portfolio/generate', {
      resume_id: resumeId,
      theme_slug: themeSlug,
      mode,
      subdomain,
      user_instructions: userInstructions,
    });
    return response.data;
  },

  async getPortfolio(portfolioId: string) {
    const response = await api.get(`/portfolio/${portfolioId}`);
    return response.data;
  },

  async updatePortfolio(portfolioId: string, updates: any) {
    const response = await api.put(`/portfolio/${portfolioId}`, updates);
    return response.data;
  },

  async listThemes() {
    const response = await api.get('/portfolio/themes/list');
    return response.data;
  },

  // Video Scripts
  async generateScript(portfolioId: string, title?: string) {
    const response = await api.post('/video/generate-script', {
      portfolio_id: portfolioId,
      title,
    });
    return response.data;
  },

  // Video Rendering Jobs
  async generateVideo(scriptId: string, avatarId?: string, voiceId?: string) {
    const response = await api.post('/video/generate', {
      script_id: scriptId,
      avatar_id: avatarId,
      voice_id: voiceId,
    });
    return response.data;
  },

  async getVideoJobStatus(jobId: string) {
    const response = await api.get(`/video/job/${jobId}`);
    return response.data;
  },

  // Dashboard Summary
  async getUserDashboard() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
