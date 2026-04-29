import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supplierApi, reviewApi } from '../../api'
import { Spinner, formatCurrency, formatDate } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

function getSupplierLabel(score) {
  if (score >= 90) return { label: '🟢 Elite Supplier', color: 'text-[#1c5c3e] bg-[#eaf1ed]' }
  if (score >= 75) return { label: '🔵 Trusted Supplier', color: 'text-blue-700 bg-blue-50' }
  if (score >= 50) return { label: '🟡 Average', color: 'text-yellow-700 bg-yellow-50' }
  return { label: '🔴 Risky Supplier', color: 'text-red-700 bg-red-50' }
}

export default function SupplierDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [vscoreData, setVscoreData] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supplierApi.getDashboard(),
      supplierApi.getVScore(user._id),
      reviewApi.getUserReviews(user._id)
    ])
      .then(([dashRes, vsRes, revRes]) => {
        setData(dashRes.data.data)
        setVscoreData(vsRes.data.data)
        setReviews(revRes.data.data.reviews || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user._id])

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
          Fulfillment <br className="sm:hidden" />
          <span className="text-[#2b2826]/90">personalized to you</span>
        </h1>
        <p className="text-lg text-[#2b2826]/60 mt-6 max-w-lg mx-auto font-medium">
          Manage your global supply chain with ease, {user?.name?.split(' ')[0]}.
        </p>
      </div>

      {/* Trust & Performance Section (V-Score) */}
      {vscoreData && (
        <div className="px-4 mb-8">
          <div className="bg-white border border-[#2b2826]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#2b2826]/20 transition-colors duration-300">
            {vscoreData.hasEnoughData ? (
              <>
                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
                  <div>
                    <p className="text-[#2b2826]/40 text-xs font-bold uppercase tracking-wider mb-2">Avg Rating</p>
                    <p className="text-2xl font-bold text-[#2b2826]">⭐ {vscoreData.displayRating?.toFixed(1) || '0.0'}</p>
                  </div>
                  <div>
                    <p className="text-[#2b2826]/40 text-xs font-bold uppercase tracking-wider mb-2">Reviews</p>
                    <p className="text-2xl font-bold text-[#2b2826]">🧾 {vscoreData.totalReviews || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#2b2826]/40 text-xs font-bold uppercase tracking-wider mb-2">Completion</p>
                    <p className="text-2xl font-bold text-[#2b2826]">📦 {vscoreData.completionRate}%</p>
                  </div>
                  <div>
                    <p className="text-[#2b2826]/40 text-xs font-bold uppercase tracking-wider mb-2">Cancellation</p>
                    <p className="text-2xl font-bold text-[#2b2826]">❌ {vscoreData.cancellationRate}%</p>
                  </div>
                </div>
                
                <div className="w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-[#2b2826]/10 pt-8 md:pt-0 md:pl-10">
                  <p className="text-[#2b2826]/40 text-xs font-bold uppercase tracking-wider mb-3">Your V-Score</p>
                  <div className="text-7xl font-h1 font-bold text-[#2b2826] flex items-center justify-center gap-2 mb-3 leading-none">
                    🏆 {vscoreData.VScore}
                  </div>
                  <span className={`inline-block px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${getSupplierLabel(vscoreData.VScore).color}`}>
                    {getSupplierLabel(vscoreData.VScore).label}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full text-center py-6">
                <span className="material-symbols-outlined text-5xl text-[#2b2826]/20 mb-3">analytics</span>
                <h3 className="text-xl font-bold text-[#2b2826]">Not enough data</h3>
                <p className="text-[#2b2826]/60 mt-2 max-w-md mx-auto">
                  We need a bit more order history to calculate your V-Score accurately. Keep fulfilling orders!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        
        {/* Card 1: Active Listings */}
        <Link to="/supplier/products" className="group relative bg-[#f4f3ec] rounded-full p-8 md:p-10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2 flex items-center gap-3">
              Inventory
              <span className="bg-[#eaf1ed] text-[#1c5c3e] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Live</span>
            </h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{stats.activeListings ?? 0} active products</p>
          </div>
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#2b2826]">inventory_2</span>
          </div>
        </Link>

        {/* Card 2: Pending Orders */}
        <Link to="/supplier/orders?status=pending" className="group relative bg-[#f9eee6] rounded-full p-8 md:p-10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2 flex items-center gap-3">
              Pending
              {stats.pendingOrders > 0 && (
                <span className="bg-[#fdebea] text-[#93000a] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Action needed</span>
              )}
            </h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{stats.pendingOrders ?? 0} to fulfill</p>
          </div>
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#2b2826]">local_shipping</span>
          </div>
        </Link>

        {/* Card 3: Total Orders */}
        <Link to="/supplier/orders" className="group relative bg-[#eef1f5] rounded-full p-8 md:p-10 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2">Total Orders</h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{stats.totalOrders ?? 0} received</p>
          </div>
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#2b2826]">receipt_long</span>
          </div>
        </Link>

        {/* Card 4: Revenue */}
        <div className="group relative bg-white border border-[#2b2826]/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-full p-8 md:p-10 flex items-center justify-between hover:border-[#2b2826]/30 transition-colors duration-300">
          <div className="z-10">
            <h3 className="text-2xl font-bold text-[#2b2826] mb-2">Revenue</h3>
            <p className="text-[#2b2826]/60 text-lg font-medium">{formatCurrency(stats.totalRevenue ?? 0)} total</p>
          </div>
          <div className="w-20 h-20 bg-[#faf9f6] rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 z-10">
            <span className="material-symbols-outlined text-4xl text-[#1c5c3e]">payments</span>
          </div>
        </div>

      </div>

      {/* Recent Reviews Section */}
      <div className="mt-8 px-4">
        <h2 className="text-2xl font-bold text-[#2b2826] mb-6">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <div className="bg-white border border-[#2b2826]/10 rounded-3xl p-8 text-center text-[#2b2826]/60">
            No reviews yet. Keep delivering great service to start building your reputation!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review._id} className="bg-white border border-[#2b2826]/10 rounded-3xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-[#2b2826]">{review.reviewerId?.businessName || review.reviewerId?.name}</p>
                    <p className="text-xs text-[#2b2826]/50">{formatDate(review.createdAt)}</p>
                  </div>
                  <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full font-bold text-sm">
                    ⭐ {review.rating.toFixed(1)}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-[#2b2826]/80 mt-4 leading-relaxed bg-[#f4f3ec] p-4 rounded-2xl text-sm border border-[#2b2826]/5">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Large Featured Bottom Card */}
      <div className="mt-8 px-4">
        <div className="bg-[#dfe4df] rounded-[3rem] p-12 sm:p-16 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-h1 text-3xl sm:text-4xl text-[#2b2826] font-bold mb-4">
              Expand your reach with <br className="hidden sm:block" /> New Product Listings
            </h2>
            <Link to="/supplier/products/add" className="inline-block mt-6 bg-[#2b2826] text-white font-bold px-8 py-4 rounded-full hover:bg-black transition-colors">
              Add a Product
            </Link>
          </div>
          {/* Subtle background abstract shape */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        </div>
      </div>
      
    </div>
  )
}
