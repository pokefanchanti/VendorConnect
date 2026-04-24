import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ClipboardList, TrendingUp, AlertCircle, ArrowRight, PackagePlus } from 'lucide-react'
import { supplierApi } from '../../api'
import { StatCard, OrderStatusBadge, Spinner, EmptyState, PageHeader, formatCurrency, formatDate } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

export default function SupplierDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supplierApi.getDashboard(),
      supplierApi.getOrders({ limit: 5 }),
    ])
      .then(([dashRes, ordersRes]) => {
        setData(dashRes.data.data)
        setRecentOrders(ordersRes.data.data.orders.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Spinner className="h-10 w-10" />
    </div>
  )

  const stats = data?.stats || {}

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}! 🏭`}
        subtitle="Manage your products and incoming orders."
        action={
          <Link to="/supplier/products/add" className="btn-primary">
            <PackagePlus className="w-4 h-4" />
            Add Product
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Active Listings"
          value={stats.activeListings ?? 0}
          iconBg="bg-primary-100"
          iconColor="text-primary-600"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Orders"
          value={stats.pendingOrders ?? 0}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          trend={stats.pendingOrders > 0 ? 'Needs attention' : 'All clear'}
        />
        <StatCard
          icon={ClipboardList}
          label="Total Orders"
          value={stats.totalOrders ?? 0}
          iconBg="bg-sky-100"
          iconColor="text-sky-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue ?? 0)}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          trend="From delivered orders"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Recent Orders</h2>
          <Link to="/supplier/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card-body">
            <EmptyState
              icon={ClipboardList}
              title="No orders yet"
              subtitle="Orders will appear here once retailers start purchasing."
            />
          </div>
        ) : (
          <div className="table-wrap rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Retailer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="font-medium">{order.retailerId?.businessName || order.retailerId?.name}</td>
                    <td>{order.items?.length ?? 0}</td>
                    <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                    <td><OrderStatusBadge status={order.status} /></td>
                    <td className="text-slate-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
