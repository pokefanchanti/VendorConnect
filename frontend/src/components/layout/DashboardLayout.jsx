import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#2b2826] font-body-md antialiased flex flex-col relative overflow-x-hidden">
      {/* Top Navigation */}
      <header className="flex justify-between items-center px-6 py-4 bg-transparent sticky top-0 z-40">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="font-h1 text-2xl font-bold tracking-tight text-[#2b2826]">
            VendorConnect
          </Link>
          
          {/* Top Nav Marketing Tags (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#2b2826]/70">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              100% verified suppliers
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              Fast & secure B2B logistics
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
              Transparent pricing with no hidden fees
            </span>
          </div>
        </div>

        {/* Right: Actions & Hamburger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block font-label-sm font-bold text-sm tracking-widest uppercase mr-2">
            My Account
          </div>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors focus:outline-none focus:ring-2 focus:ring-black/20"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* Slide-out Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  )
}
