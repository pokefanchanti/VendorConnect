import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'

const supplierLinks = [
  { to: '/supplier/dashboard', label: 'Dashboard' },
  { to: '/supplier/products', label: 'My Products' },
  { to: '/supplier/products/add', label: 'Add Product' },
  { to: '/supplier/orders', label: 'Orders' },
]

const retailerLinks = [
  { to: '/retailer/dashboard', label: 'Dashboard' },
  { to: '/retailer/browse', label: 'Browse Products' },
  { to: '/retailer/orders', label: 'My Orders' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'supplier' ? supplierLinks : retailerLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="font-h2 text-2xl font-bold text-[#2b2826]">Menu</h2>
          <div className="flex items-center gap-4">
            <span className="font-label-sm uppercase tracking-widest text-xs font-bold text-[#2b2826]/60">
              {user?.role === 'supplier' ? 'Supplier' : 'Retailer'}
            </span>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* User Info minimal */}
        <div className="px-8 pb-6 border-b border-[#2b2826]/5">
          <p className="font-bold text-[#2b2826]">{user?.name}</p>
          <p className="text-sm text-[#2b2826]/60">{user?.email}</p>
        </div>

        {/* Links Area */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-8 mb-4">
            <span className="font-label-sm text-[10px] uppercase tracking-[0.2em] font-bold text-[#2b2826]/50">Explore</span>
          </div>
          
          <nav className="flex flex-col">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `px-8 py-4 text-lg font-bold transition-colors flex justify-between items-center group ${
                    isActive ? 'text-[#2b2826]' : 'text-[#2b2826]/70 hover:text-[#2b2826]'
                  }`
                }
              >
                {label}
                <span className="material-symbols-outlined text-[#2b2826]/30 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-[#2b2826]/5">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-full border border-[#2b2826]/10 text-[#2b2826] font-bold hover:bg-[#2b2826]/5 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}
