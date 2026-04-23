import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Clock, CheckCircle, TrendingUp, ArrowRight, Store } from 'lucide-react'
import { retailerApi } from '../../api'
import { StatCard, OrderStatusBadge, Spinner, EmptyState, PageHeader, formatCurrency, formatDate } from '../../components/ui'
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
      <Spinner className="h-10 w-10" />
    </div>
  )

  const stats = data?.stats || {}
  const recentOrders = data?.recentOrders || []

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle="Here's a summary of your purchasing activity."
        action={
          <Link to="/retailer/browse" className="btn-primary">
            <Store className="w-4 h-4" />
            Browse Products
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats.totalOrders ?? 0}
          iconBg="bg-primary-100"
          iconColor="text-primary-600"
        />
        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={stats.pendingOrders ?? 0}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Delivered"
          value={stats.deliveredOrders ?? 0}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Spend"
          value={formatCurrency(stats.totalSpend ?? 0)}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          trend="Delivered orders only"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Recent Orders</h2>
          <Link to="/retailer/orders" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card-body">
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              subtitle="Browse products and place your first order."
              action={<Link to="/retailer/browse" className="btn-primary">Browse Products</Link>}
            />
          </div>
        ) : (
          <div className="table-wrap rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="font-medium">{order.supplierId?.businessName || order.supplierId?.name}</td>
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
