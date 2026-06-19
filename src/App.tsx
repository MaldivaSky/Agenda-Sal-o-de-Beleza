import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppDataProvider } from './contexts/AppDataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Public Portal
import Portal from './pages/public/Portal';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminServices from './pages/admin/AdminServices';
import AdminClients from './pages/admin/AdminClients';
import AdminFinances from './pages/admin/AdminFinances';
import AdminPortfolio from './pages/admin/AdminPortfolio';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientHistory from './pages/client/ClientHistory';

function ProtectedRoute({ children, roleNeeded }: { children: React.ReactNode, roleNeeded?: 'ADMIN' | 'CLIENT' }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roleNeeded && currentUser.role !== roleNeeded) {
    return <Navigate to={currentUser.role === 'ADMIN' ? '/agenda' : '/agendar'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AppDataProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Portal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Register />} />
            
            <Route element={<Layout />}>
              {/* Admin specific routes */}
              <Route path="/agenda" element={
                <ProtectedRoute roleNeeded="ADMIN"><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/agenda-lista" element={
                <ProtectedRoute roleNeeded="ADMIN"><AdminSchedule /></ProtectedRoute>
              } />
              <Route path="/servicos" element={
                <ProtectedRoute roleNeeded="ADMIN"><AdminServices /></ProtectedRoute>
              } />
              <Route path="/clientes" element={
                <ProtectedRoute roleNeeded="ADMIN"><AdminClients /></ProtectedRoute>
              } />
              <Route path="/financeiro" element={
                <ProtectedRoute roleNeeded="ADMIN"><AdminFinances /></ProtectedRoute>
              } />
              <Route path="/portal-admin" element={
                <ProtectedRoute roleNeeded="ADMIN"><AdminPortfolio /></ProtectedRoute>
              } />

              {/* Client specific routes */}
              <Route path="/agendar" element={
                <ProtectedRoute roleNeeded="CLIENT"><ClientDashboard /></ProtectedRoute>
              } />
              <Route path="/historico" element={
                <ProtectedRoute roleNeeded="CLIENT"><ClientHistory /></ProtectedRoute>
              } />

            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </AppDataProvider>
  );
}
