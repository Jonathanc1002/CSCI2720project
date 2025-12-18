import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import LocationList from './pages/LocationList';
import LocationDetail from './pages/LocationDetail';
import MapView from './pages/MapView';
import Favorites from './pages/Favorites';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
            {/* Home redirects to locations */}
            <Route path="/" element={<Navigate to="/locations" replace />} />
            
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/locations" element={<LocationList />} />
            <Route path="/locations/:id" element={<LocationDetail />} />
            <Route path="/map" element={<MapView />} />
            
            {/* Protected routes - TODO: Add authentication guards */}
            <Route path="/favorites" element={<Favorites />} />
            
            {/* Admin routes - TODO: Add admin role guard */}
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default App;
