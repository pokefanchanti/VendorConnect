import { useEffect, useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { supplierApi, reviewApi } from '../../api'
import { PageHeader, OrderStatusBadge, EmptyState, Spinner, formatCurrency, formatDate } from '../../components/ui'
import toast from 'react-hot-toast'

const STATUS_ACTIONS = {
  pending:  [{ label: 'Accept Order', next: 'accepted', cls: 'btn-primary' }, { label: 'Cancel', next: 'cancelled', cls: 'btn-danger' }],
  accepted: [{ label: 'Mark Picked Up', action: 'pickup', cls: 'btn-primary' }, { label: 'Cancel', next: 'cancelled', cls: 'btn-danger' }],
  in_transit: [{ label: 'Mark Delivered', action: 'deliver', cls: 'btn-primary' }],
}

function OrderRow({ order, onStatusChange, onRate }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pickupTimeStr, setPickupTimeStr] = useState('')
  const actions = STATUS_ACTIONS[order.status] || []

  const handleAction = async (actionItem) => {
    setLoading(true)
    try {
      if (actionItem.action === 'pickup') {
        await supplierApi.markPickedUp(order._id)
        toast.success('Order marked as picked up.')
      } else if (actionItem.action === 'deliver') {
        await supplierApi.markDelivered(order._id)
        toast.success('Order marked as delivered.')
      } else {
        await supplierApi.updateOrderStatus(order._id, actionItem.next)
        toast.success(`Order marked as ${actionItem.next}.`)
      }
      onStatusChange()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedulePickup = async () => {
    if (!pickupTimeStr) return toast.error('Please select a pickup time.')
    setLoading(true)
    try {
      await supplierApi.schedulePickup(order._id, pickupTimeStr)
      toast.success('Pickup scheduled!')
      onStatusChange()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup.')
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
            {actions.map((actionItem, idx) => (
              <button key={idx} disabled={loading} onClick={() => handleAction(actionItem)}
                className={`${actionItem.cls} btn-sm`}>
                {loading ? '...' : actionItem.label}
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
                  <span className="font-medium text-slate-700">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 mt-2">
                <span className="text-slate-500">Items Total:</span>
                <span className="font-medium text-slate-700">{formatCurrency(order.itemsTotal || (order.totalAmount - (order.deliveryCost || 0)))}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm pt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined w-4 h-4 text-slate-400 text-[16px]">local_shipping</span>
                  <span className="text-slate-500">Delivery Cost ({order.deliveryType || 'standard'}):</span>
                </div>
                <span className="font-medium text-slate-500">{formatCurrency(order.deliveryCost || 0)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-200 mt-1">
                <span>Total Paid by Retailer:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>

              {order.status === 'delivered' ? (
                <div className="flex items-center justify-between text-sm font-bold text-[#1c5c3e] bg-[#eaf1ed] p-2 rounded-lg mt-3 border border-[#1c5c3e]/20">
                  <span>Your Earnings:</span>
                  <span>{formatCurrency(order.itemsTotal || (order.totalAmount - (order.deliveryCost || 0)))}</span>
                </div>
              ) : order.status === 'cancelled' ? (
                <div className="flex items-center justify-between text-sm font-bold text-red-700 bg-red-50 p-2 rounded-lg mt-3 border border-red-100">
                  <span>Status:</span>
                  <span>Cancelled</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-sm font-bold text-amber-700 bg-amber-50 p-2 rounded-lg mt-3 border border-amber-100">
                  <span>Status:</span>
                  <span>Pending / Processing</span>
                </div>
              )}

              {order.notes && (
                <p className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">Notes: {order.notes}</p>
              )}
              {order.retailerId?.phone && (
                <p className="text-xs text-slate-500">Contact: {order.retailerId.phone}</p>
              )}

              <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Logistics</h4>
                
                {order.deliveryTime && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Requested Delivery:</span> {new Date(order.deliveryTime).toLocaleString()}
                  </p>
                )}

                {order.pickedUpAt && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Picked Up:</span> {new Date(order.pickedUpAt).toLocaleString()}
                  </p>
                )}
                
                {order.deliveredAt && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Delivered:</span> {new Date(order.deliveredAt).toLocaleString()}
                  </p>
                )}

                {order.pickupTime && !order.pickedUpAt ? (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Scheduled Pickup:</span> {new Date(order.pickupTime).toLocaleString()}
                  </p>
                ) : (!order.pickedUpAt && (order.status === 'pending' || order.status === 'accepted')) ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="datetime-local"
                      className="input py-1 text-sm w-auto flex-1"
                      value={pickupTimeStr}
                      onChange={(e) => setPickupTimeStr(e.target.value)}
                    />
                    <button
                      onClick={handleSchedulePickup}
                      disabled={loading}
                      className="btn-primary py-1 px-3 text-sm whitespace-nowrap"
                    >
                      {loading ? '...' : 'Schedule Pickup'}
                    </button>
                  </div>
                ) : null}

                <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                  <span className="font-medium">Stage:</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {order.orderStatusStage?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {order.status === 'delivered' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {order.isReviewed ? (
                    <p className="text-sm font-medium text-[#1c5c3e] bg-[#eaf1ed] px-3 py-2 rounded-lg inline-block">
                      You already rated this retailer
                    </p>
                  ) : (
                    <button onClick={() => onRate(order)} className="btn-primary btn-sm">
                      ⭐ Rate Retailer
                    </button>
                  )}
                </div>
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
  const [reviewOrder, setReviewOrder] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchOrders = (bg = false) => {
    if (!bg) setLoading(true)
    supplierApi.getOrders(statusFilter ? { status: statusFilter } : {})
      .then((res) => setOrders(res.data.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => fetchOrders(true), 10000)
    return () => clearInterval(interval)
  }, [statusFilter])

  const handleOpenReview = (order) => {
    setReviewOrder(order)
    setRating(0)
    setComment('')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (rating === 0) return toast.error('Please select a rating')
    
    setSubmitting(true)
    try {
      await reviewApi.createReview({
        orderId: reviewOrder._id,
        rating,
        comment
      })
      toast.success('Review submitted successfully')
      setReviewOrder(null)
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Incoming Orders" subtitle="Review and manage orders from retailers." />

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'accepted', 'in_transit', 'delivered', 'cancelled'].map((s) => (
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
                <OrderRow key={order._id} order={order} onStatusChange={fetchOrders} onRate={handleOpenReview} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="font-h1 text-2xl font-bold text-[#2b2826] mb-2">Rate Retailer</h3>
            <p className="text-sm text-[#2b2826]/60 mb-6">
              How was your experience working with <span className="font-semibold text-[#2b2826]">{reviewOrder.retailerId?.businessName || reviewOrder.retailerId?.name}</span>?
            </p>
            
            <form onSubmit={handleSubmitReview}>
              <div className="flex gap-2 justify-center mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all duration-300 ${star <= rating ? 'text-yellow-400 scale-110' : 'text-slate-200 hover:text-yellow-200 hover:scale-110'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#2b2826] mb-2">Comment (Optional)</label>
                <textarea
                  className="input w-full bg-[#f4f3ec] border-transparent focus:bg-white resize-none"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience..."
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setReviewOrder(null)} className="btn-secondary flex-1 py-3 rounded-full">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 rounded-full">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
