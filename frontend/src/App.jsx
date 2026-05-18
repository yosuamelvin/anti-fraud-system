import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CaseList from './pages/CaseList';
import CaseDetail from './pages/CaseDetail';
import CreateCase from './pages/CreateCase';
import MyCases from './pages/MyCases';
import Reports from './pages/Reports';
import ToastProvider from './components/ToastProvider';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cases" element={<CaseList />} />
            <Route 
              path="cases/create" 
              element={
                <ProtectedRoute roles={['investigator', 'kepala_departemen', 'kepala_divisi', 'superuser']}>
                  <CreateCase />
                </ProtectedRoute>
              } 
            />
            <Route path="cases/:id" element={<CaseDetail />} />
            <Route 
              path="my-cases" 
              element={
                <ProtectedRoute roles={['investigator']}>
                  <MyCases />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="reports" 
              element={
                <ProtectedRoute roles={['kepala_departemen', 'kepala_divisi', 'direktur', 'presiden_direktur', 'superuser']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="settings" 
              element={
                <ProtectedRoute roles={['superuser']}>
                  <div className="p-6">Settings - Coming Soon</div>
                </ProtectedRoute>
              } 
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;