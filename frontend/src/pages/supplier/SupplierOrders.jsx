import { useEffect, useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { supplierApi } from '../../api'
import { PageHeader, OrderStatusBadge, EmptyState, Spinner, formatCurrency, formatDate } from '../../components/ui'
import toast from 'react-hot-toast'

const STATUS_ACTIONS = {
  pending:  [{ label: 'Accept Order', next: 'accepted', cls: 'btn-primary' }, { label: 'Cancel', next: 'cancelled', cls: 'btn-danger' }],
  accepted: [{ label: 'Mark Shipped', next: 'shipped', cls: 'btn-primary' }, { label: 'Cancel', next: 'cancelled', cls: 'btn-danger' }],
  shipped:  [{ label: 'Mark Delivered', next: 'delivered', cls: 'btn-primary' }],
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const actions = STATUS_ACTIONS[order.status] || []

  const handleAction = async (next) => {
    setLoading(true)
    try {
      await supplierApi.updateOrderStatus(order._id, next)
      toast.success(`Order marked as ${next}.`)
      onStatusChange()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(!expanded)}>
        <td className="font-mono text-xs text-slate-500">#{order._id.slice(-6).toUpperCase()}</td>
        <td>
          <div>
            <p className="font-medium text-slate-800">{order.retailerId?.businessName || order.retailerId?.name}</p>
            <p className="text-xs text-slate-400">{order.retailerId?.email}</p>
          </div>
        </td>
        <td>{order.items?.length ?? 0}</td>
        <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
        <td><OrderStatusBadge status={order.status} /></td>
        <td className="text-slate-500 text-sm">{formatDate(order.createdAt)}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-1.5 flex-wrap">
            {actions.map(({ label, next, cls }) => (
              <button key={next} disabled={loading} onClick={() => handleAction(next)}
                className={`${cls} btn-sm`}>
                {loading ? '...' : label}
              </button>
            ))}
          </div>
        </td>
        <td className="text-slate-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="bg-slate-50 px-5 py-3">
            <div className="space-y-1.5">
              {order.items?.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{item.productId?.name}</span>
                    <span className="text-slate-400">x {item.quantity} {item.productId?.unit}</span>
                    <span className="text-slate-400">@ {formatCurrency(item.unitPrice)}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
              {order.notes && (
                <p className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">Notes: {order.notes}</p>
              )}
              {order.retailerId?.phone && (
                <p className="text-xs text-slate-500">Contact: {order.retailerId.phone}</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function SupplierOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = () => {
    setLoading(true)
    supplierApi.getOrders(statusFilter ? { status: statusFilter } : {})
      .then((res) => setOrders(res.data.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchOrders, [statusFilter])

  return (
    <div>
      <PageHeader title="Incoming Orders" subtitle="Review and manage orders from retailers." />

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'accepted', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} id={`sup-filter-${s || 'all'}`} onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Spinner className="h-10 w-10" /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders found"
          subtitle={statusFilter ? `No ${statusFilter} orders.` : 'No orders received yet.'} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th><th>Retailer</th><th>Items</th><th>Total</th>
                <th>Status</th><th>Date</th><th>Actions</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} onStatusChange={fetchOrders} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
