import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { retailerApi } from '../../api'
import { Spinner } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

export default function RetailerDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    retailerApi.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Spinner className="h-10 w-10 text-[#2b2826]" />
    </div>
  )

  const stats = data?.stats || {}

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-24">
      {/* Hero Section */}
      <div className="text-center mb-16 px-4">
        <h1 className="font-h1 text-5xl sm:text-6xl text-[#2b2826] font-bold tracking-tight mb-4 leading-tight">
          Sourcing <br className="sm:hidden" />
          <span className="text-[#2b2826]/90">personalized to you</span>
        </h1>
        <p className="text-lg text-[#2b2826]/60 mt-6 max-w-lg mx-auto font-medium">
          Customized B2B commerce starts here, {user?.name?.split(' ')[0]}.
        </p>
      </div>

      {/* Pill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        
        {/* Card 1: Total Orders */}
        <Link to="/retailer/orders" className="group relative bg-[#f4f3ec] rounded-full p-8 md:p-10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2 flex items-center gap-3">
              Total orders
              <span className="bg-[#eaf1ed] text-[#1c5c3e] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Active</span>
            </h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{stats.totalOrders ?? 0} shipments</p>
          </div>
          {/* Floating Filler Icon */}
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#2b2826]">package_2</span>
          </div>
        </Link>

        {/* Card 2: Pending Orders */}
        <Link to="/retailer/orders?status=pending" className="group relative bg-[#f9eee6] rounded-full p-8 md:p-10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2">Pending</h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{stats.pendingOrders ?? 0} awaiting</p>
          </div>
          {/* Floating Filler Icon */}
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#2b2826]">schedule</span>
          </div>
        </Link>

        {/* Card 3: Delivered */}
        <div className="group relative bg-[#eef1f5] rounded-full p-8 md:p-10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2">Delivered</h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{stats.deliveredOrders ?? 0} completed</p>
          </div>
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#2b2826]">where_to_vote</span>
          </div>
        </div>

        {/* Card 4: Browse Catalog Action */}
        <Link to="/retailer/browse" className="group relative bg-white border border-[#2b2826]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-full p-8 md:p-10 flex items-center justify-between hover:border-[#2b2826]/30 transition-colors duration-300">
          <div className="z-10 flex items-center gap-4">
            <h3 className="text-2xl font-bold text-[#2b2826]">Browse all suppliers</h3>
          </div>
          <span className="material-symbols-outlined text-[#2b2826]/40 text-3xl group-hover:translate-x-2 transition-transform duration-300">arrow_forward</span>
        </Link>

      </div>

      {/* Large Featured Bottom Card */}
      <div className="mt-8 px-4">
        <div className="bg-[#dfe4df] rounded-[3rem] p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-h1 text-3xl sm:text-4xl text-[#2b2826] font-bold mb-4">
              Get your edge back with <br className="hidden sm:block" /> Verified Global Suppliers
            </h2>
            <Link to="/retailer/browse" className="inline-block mt-6 bg-[#2b2826] text-white font-bold px-8 py-4 rounded-full hover:bg-black transition-colors">
              Start Sourcing
            </Link>
          </div>
          {/* Subtle background abstract shape */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        </div>
      </div>
      
    </div>
  )
}
