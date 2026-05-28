import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import ResumeOptimizerPage from './pages/ResumeOptimizerPage';
import InterviewSimulatorPage from './pages/InterviewSimulatorPage';
import ResearchCenterPage from './pages/ResearchCenterPage';
import Login from './components/Auth/Login';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-slate-900 bg-[#030712] text-slate-400">Loading AutoHire Context...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/optimize" element={<PrivateRoute><ResumeOptimizerPage /></PrivateRoute>} />
        <Route path="/interviews" element={<PrivateRoute><InterviewSimulatorPage /></PrivateRoute>} />
        <Route path="/research" element={<PrivateRoute><ResearchCenterPage /></PrivateRoute>} />
        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
