import { useEffect, useState } from 'react'
import { ShoppingCart, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { retailerApi } from '../../api'
import { PageHeader, OrderStatusBadge, EmptyState, Spinner, formatCurrency, formatDate } from '../../components/ui'
import { Link } from 'react-router-dom'

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(!expanded)}>
        <td className="font-mono text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</td>
        <td className="font-medium">{order.supplierId?.businessName || order.supplierId?.name}</td>
        <td>{order.items?.length ?? 0} item{order.items?.length !== 1 ? 's' : ''}</td>
        <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
        <td><OrderStatusBadge status={order.status} /></td>
        <td className="text-slate-500">{formatDate(order.createdAt)}</td>
        <td className="text-slate-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-slate-50 px-5 py-3">
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{item.productId?.name}</span>
                    <span className="text-slate-400">× {item.quantity} {item.productId?.unit}</span>
                  </div>
                  <span className="font-medium text-slate-700">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              {order.notes && (
                <p className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">
                  📝 {order.notes}
                </p>
              )}
              <p className="text-xs text-slate-400 border-t border-slate-200 pt-2 mt-2">
                💵 Payment: Cash on Delivery · Status: {order.paymentStatus}
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function RetailerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    retailerApi.getOrders(statusFilter ? { status: statusFilter } : {})
      .then((res) => setOrders(res.data.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle="Track all your orders and their status."
        action={
          <Link to="/retailer/browse" className="btn-primary">+ New Order</Link>
        }
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'accepted', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button
            key={s}
            id={`filter-${s || 'all'}`}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Spinner className="h-10 w-10" /></div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          subtitle={statusFilter ? `No ${statusFilter} orders.` : 'You haven\'t placed any orders yet.'}
          action={!statusFilter && <Link to="/retailer/browse" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
