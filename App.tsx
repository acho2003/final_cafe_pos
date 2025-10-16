import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { UserRole } from './types';

// Import Pages
import Login from './pages/Login';
import OrderPage from './pages/customer/OrderPage';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CafeAdminPanel from './pages/cafe-admin/CafeAdminPanel';
import SuperAdminPanel from './pages/super-admin/SuperAdminPanel';
import NotFound from './pages/NotFound';
import NewOrderPage from './pages/shared/NewOrderPage';

const AppRoutes: React.FC = () => {
  const authContext = React.useContext(AuthContext);

  const getHomeRedirect = () => {
    if (!authContext || !authContext.currentUser) return '/login';
    switch (authContext.currentUser.role) {
      case UserRole.SUPER_ADMIN:
        return '/super-admin/cafes';
      case UserRole.CAFE_ADMIN:
        return '/cafe-admin/orders';
      case UserRole.MANAGER:
        return '/manager/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/order" element={<OrderPage />} />
      
      {/* Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]} />}>
        <Route path="/super-admin/*" element={
            <Layout>
                <Routes>
                    <Route path="cafes" element={<SuperAdminPanel />} />
                    <Route path="users" element={<SuperAdminPanel />} />
                </Routes>
            </Layout>
        }/>
      </Route>

      {/* Cafe Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.CAFE_ADMIN]} />}>
         <Route path="/cafe-admin/*" element={
            <Layout>
                <Routes>
                    <Route path="orders" element={<CafeAdminPanel />} />
                    <Route path="menu" element={<CafeAdminPanel />} />
                    <Route path="managers" element={<CafeAdminPanel />} />
                    <Route path="qr" element={<CafeAdminPanel />} />
                    <Route path="reports" element={<CafeAdminPanel />} />
                    <Route path="new-order" element={<NewOrderPage />} />
                </Routes>
            </Layout>
        }/>
      </Route>

      {/* Manager Routes */}
      <Route element={<ProtectedRoute allowedRoles={[UserRole.MANAGER]} />}>
         <Route path="/manager/*" element={
            <Layout>
                <Routes>
                    <Route path="dashboard" element={<ManagerDashboard />} />
                    <Route path="new-order" element={<NewOrderPage />} />
                </Routes>
            </Layout>
        }/>
      </Route>
      
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;