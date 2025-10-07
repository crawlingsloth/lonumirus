import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { seedDatabase } from './lib/seed';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BoatsListPage } from './pages/admin/BoatsListPage';
import { BoatFormPage } from './pages/admin/BoatFormPage';
import { UsersPage } from './pages/admin/UsersPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { BatchesListPage } from './pages/admin/BatchesListPage';
import { BatchDetailPage } from './pages/admin/BatchDetailPage';

// Delivery pages
import { DeliveryBatchesPage } from './pages/delivery/DeliveryBatchesPage';
import { DeliveryBatchDetailPage } from './pages/delivery/DeliveryBatchDetailPage';

// Customer pages
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { NewOrderPage } from './pages/customer/NewOrderPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';

// Public pages
import { PublicBoatsPage } from './pages/public/PublicBoatsPage';
import { PublicBoatDetailPage } from './pages/public/PublicBoatDetailPage';
import { ShareOrderPage } from './pages/public/ShareOrderPage';

// Print pages
import { PrintManifestPage } from './pages/print/PrintManifestPage';
import { PrintLabelsPage } from './pages/print/PrintLabelsPage';

function App() {
  useEffect(() => {
    // Seed database on first load
    seedDatabase();
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Public boat pages */}
        <Route path="/boats" element={<PublicBoatsPage />} />
        <Route path="/boats/:slug" element={<PublicBoatDetailPage />} />
        <Route path="/share/order/:token" element={<ShareOrderPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/boats"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <BoatsListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/boats/new"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <BoatFormPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/boats/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <BoatFormPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <OrdersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/batches"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <BatchesListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/batches/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <BatchDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Delivery routes */}
        <Route
          path="/delivery/batches"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <Layout>
                <DeliveryBatchesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/batches/:id"
          element={
            <ProtectedRoute allowedRoles={['delivery']}>
              <Layout>
                <DeliveryBatchDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Customer routes */}
        <Route
          path="/customer/orders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Layout>
                <CustomerOrdersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/new-order"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Layout>
                <NewOrderPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Layout>
                <OrderDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Print routes */}
        <Route
          path="/admin/batches/:id/print-manifest"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PrintManifestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/batches/:id/print-labels"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PrintLabelsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
