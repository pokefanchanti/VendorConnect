import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList,
  LogOut, Store, PackagePlus
} from 'lucide-react'
import Logo from '../ui/Logo'

const supplierLinks = [
  { to: '/supplier/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/supplier/products', icon: Package, label: 'My Products' },
  { to: '/supplier/products/add', icon: PackagePlus, label: 'Add Product' },
  { to: '/supplier/orders', icon: ClipboardList, label: 'Orders' },
]

const retailerLinks = [
  { to: '/retailer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/retailer/browse', icon: Store, label: 'Browse Products' },
  { to: '/retailer/orders', icon: ShoppingCart, label: 'My Orders' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'supplier' ? supplierLinks : retailerLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-stone-50 border-r border-secondary-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-secondary-200">
        <Logo variant="sidebar" />
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="bg-slate-50 rounded-xl px-3 py-3">
          <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            user?.role === 'supplier'
              ? 'bg-violet-100 text-violet-700'
              : 'bg-sky-100 text-sky-700'
          }`}>
            {user?.role === 'supplier' ? '🏭 Supplier' : '🛒 Retailer'}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
