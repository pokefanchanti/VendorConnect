import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Retailer pages
import RetailerDashboard from './pages/retailer/RetailerDashboard'
import BrowseProducts from './pages/retailer/BrowseProducts'
import RetailerOrders from './pages/retailer/RetailerOrders'

// Supplier pages
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SupplierProducts from './pages/supplier/SupplierProducts'
import AddProduct from './pages/supplier/AddProduct'
import SupplierOrders from './pages/supplier/SupplierOrders'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Retailer routes */}
        <Route
          path="/retailer"
          element={
            <RoleRoute role="retailer">
              <DashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RetailerDashboard />} />
          <Route path="browse" element={<BrowseProducts />} />
          <Route path="orders" element={<RetailerOrders />} />
        </Route>

        {/* Supplier routes */}
        <Route
          path="/supplier"
          element={
            <RoleRoute role="supplier">
              <DashboardLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SupplierDashboard />} />
          <Route path="products" element={<SupplierProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="orders" element={<SupplierOrders />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
