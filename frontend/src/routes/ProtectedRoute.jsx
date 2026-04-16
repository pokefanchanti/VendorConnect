import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Requires login
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Requires a specific role
export function RoleRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === 'supplier' ? '/supplier/dashboard' : '/retailer/dashboard'} replace />
  }
  return children
}
