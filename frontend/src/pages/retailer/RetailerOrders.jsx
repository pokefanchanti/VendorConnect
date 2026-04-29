import { useEffect, useState } from 'react'
import { ShoppingCart, ChevronDown, ChevronUp, Package } from 'lucide-react'
import { retailerApi, reviewApi } from '../../api'
import { PageHeader, OrderStatusBadge, EmptyState, Spinner, formatCurrency, formatDate } from '../../components/ui'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function getRelativeTime(date) {
  if (!date) return '';
  const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
}

function OrderRow({ order, onRate }) {
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
              
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined w-4 h-4 text-slate-400 text-[16px]">local_shipping</span>
                  <span className="text-slate-500">Delivery ({order.deliveryType || 'standard'})</span>
                </div>
                <span className="font-medium text-slate-500">{formatCurrency(order.deliveryCost || 0)}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-slate-800 pt-1">
                <span>Total:</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Logistics Timeline</h4>
                
                {/* Timeline Progress */}
                <div className="flex items-center justify-between relative px-2 mb-2">
                  <div className="absolute left-6 right-6 top-3 h-1 bg-slate-100 -z-10 rounded-full"></div>
                  {(() => {
                    const stages = ['pending', 'pickup_scheduled', 'in_transit', 'delivered'];
                    const currentIndex = stages.indexOf(order.orderStatusStage || 'pending');
                    
                    return stages.map((stage, idx) => {
                      const isCompleted = idx <= currentIndex;
                      const isActive = idx === currentIndex;
                      return (
                        <div key={stage} className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isCompleted ? 'bg-[#1c5c3e] text-white' : 'bg-slate-200 text-slate-400'} ${isActive ? 'ring-4 ring-[#eaf1ed]' : ''}`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${isActive ? 'text-[#1c5c3e]' : 'text-slate-400'}`}>
                            {stage.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
                
                {/* Detailed times */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  {order.deliveryTime && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium block text-xs">Requested Delivery:</span> 
                      {new Date(order.deliveryTime).toLocaleString()}
                    </p>
                  )}
                  {order.pickupTime && !order.pickedUpAt && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium block text-xs">Scheduled Pickup:</span> 
                      {new Date(order.pickupTime).toLocaleString()}
                    </p>
                  )}
                  {order.pickedUpAt && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium block text-xs text-amber-600">Picked Up ({getRelativeTime(order.pickedUpAt)})</span>
                      {new Date(order.pickedUpAt).toLocaleString()}
                    </p>
                  )}
                  {order.deliveredAt && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium block text-xs text-green-600">Delivered ({getRelativeTime(order.deliveredAt)})</span>
                      {new Date(order.deliveredAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {order.notes && (
                <p className="text-xs text-slate-500 border-t border-slate-200 pt-2 mt-2">
                  📝 {order.notes}
                </p>
              )}
              <p className="text-xs text-slate-400 border-t border-slate-200 pt-2 mt-2">
                💵 Payment: Cash on Delivery · Status: {order.status === 'cancelled' ? 'Cancelled' : order.paymentStatus === 'pending' ? 'Pending Payment' : 'Paid'}
              </p>

              {order.status === 'delivered' && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {order.isReviewed ? (
                    <p className="text-sm font-medium text-[#1c5c3e] bg-[#eaf1ed] px-3 py-2 rounded-lg inline-block">
                      You already rated this supplier
                    </p>
                  ) : (
                    <button onClick={() => onRate(order)} className="btn-primary btn-sm">
                      ⭐ Rate Supplier
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

export default function RetailerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [reviewOrder, setReviewOrder] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchOrders = (bg = false) => {
    if (!bg) setLoading(true)
    retailerApi.getOrders(statusFilter ? { status: statusFilter } : {})
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
      <PageHeader
        title="My Orders"
        subtitle="Track all your orders and their status."
        action={
          <Link to="/retailer/browse" className="btn-primary">+ New Order</Link>
        }
      />

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'accepted', 'in_transit', 'delivered', 'cancelled'].map((s) => (
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
                <OrderRow key={order._id} order={order} onRate={handleOpenReview} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="font-h1 text-2xl font-bold text-[#2b2826] mb-2">Rate Supplier</h3>
            <p className="text-sm text-[#2b2826]/60 mb-6">
              How was your experience with <span className="font-semibold text-[#2b2826]">{reviewOrder.supplierId?.businessName || reviewOrder.supplierId?.name}</span>?
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
