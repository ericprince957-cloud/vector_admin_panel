import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookForm from './pages/BookForm';
import Categories from './pages/Categories';
import Authors from './pages/Authors';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Downloads from './pages/Downloads';
import Messages from './pages/Messages';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ActivityLog from './pages/ActivityLog';
import SearchPage from './pages/SearchPage';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'ADMIN' | 'EDITOR' }) {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && state.user?.role !== requiredRole && state.user?.role !== 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { state } = useApp();

  return (
    <Routes>
      <Route path="/login" element={state.isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
      <Route path="/admin/books/new" element={<ProtectedRoute><BookForm /></ProtectedRoute>} />
      <Route path="/admin/books/:id" element={<ProtectedRoute><BookForm /></ProtectedRoute>} />
      <Route path="/admin/books/:id/edit" element={<ProtectedRoute><BookForm /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/admin/authors" element={<ProtectedRoute><Authors /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/admin/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/admin/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="ADMIN"><Settings /></ProtectedRoute>} />
      <Route path="/admin/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
