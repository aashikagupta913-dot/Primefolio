import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Pricing from '../pages/Pricing';
import { GetStartedInfo } from '../pages/GetStartedInfo';
import Dashboard from '../pages/Dashboard';
import UploadResume from '../pages/UploadResume';
import PortfolioCreation from '../pages/PortfolioCreation';
import ThemeGallery from '../pages/ThemeGallery';
import PortfolioPreview from '../pages/PortfolioPreview';
import AiVideoGenerator from '../pages/AiVideoGenerator';

import { ProtectedRoute } from '../components/common/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/get-started" element={<GetStartedInfo />} />

      {/* Protected App Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadResume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-portfolio"
        element={
          <ProtectedRoute>
            <PortfolioCreation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/themes"
        element={
          <ProtectedRoute>
            <ThemeGallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio/preview/:id"
        element={
          <ProtectedRoute>
            <PortfolioPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-generator"
        element={
          <ProtectedRoute>
            <AiVideoGenerator />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
