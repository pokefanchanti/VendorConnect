import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, PackagePlus, Pencil, Power } from 'lucide-react'
import { supplierApi } from '../../api'
import { PageHeader, EmptyState, Spinner, ConfirmModal, formatCurrency, formatDate } from '../../components/ui'
import toast from 'react-hot-toast'

function EditModal({ listing, onClose, onSave }) {
  const [form, setForm] = useState({
    price: listing?.price || '',
    stock: listing?.stock || '',
    minOrderQty: listing?.minOrderQty || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await supplierApi.updateProduct(listing._id, form)
      toast.success('Product updated.')
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!listing) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Edit Listing</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm font-medium text-slate-700 mb-4">{listing.productId?.name}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Price (₹)</label>
              <input type="number" className="input" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} min={0} required />
            </div>
            <div className="form-group">
              <label className="label">Stock ({listing.productId?.unit})</label>
              <input type="number" className="input" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })} min={0} required />
            </div>
            <div className="form-group">
              <label className="label">Min. Order Qty</label>
              <input type="number" className="input" value={form.minOrderQty}
                onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })} min={1} required />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SupplierProducts() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  const fetchListings = () => {
    setLoading(true)
    supplierApi.getProducts()
      .then((res) => setListings(res.data.data.listings))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchListings, [])

  const handleDeactivate = async () => {
    setDeactivateLoading(true)
    try {
      await supplierApi.deleteProduct(deactivateTarget._id)
      toast.success('Product deactivated.')
      setDeactivateTarget(null)
      fetchListings()
    } catch (err) {
      toast.error('Failed to deactivate.')
    } finally {
      setDeactivateLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Products"
        subtitle="Manage your product listings."
        action={
          <Link to="/supplier/products/add" className="btn-primary">
            <PackagePlus className="w-4 h-4" />
            Add Product
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-32"><Spinner className="h-10 w-10" /></div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products listed yet"
          subtitle="Add your first product to start receiving orders."
          action={<Link to="/supplier/products/add" className="btn-primary"><PackagePlus className="w-4 h-4" />Add Product</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Min. Order</th>
                <th>Status</th>
                <th>Listed On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {listing.productId?.imageUrl
                          ? <img src={listing.productId.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          : <Package className="w-4 h-4 text-slate-400" />}
                      </div>
                      <span className="font-medium text-slate-800">{listing.productId?.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-600">{listing.productId?.category}</span>
                  </td>
                  <td className="font-semibold">{formatCurrency(listing.price)}</td>
                  <td>{listing.stock} {listing.productId?.unit}</td>
                  <td>{listing.minOrderQty}</td>
                  <td>
                    <span className={`badge ${listing.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>
                      {listing.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-slate-500">{formatDate(listing.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`edit-${listing._id}`}
                        onClick={() => setEditTarget(listing)}
                        className="btn-ghost btn-sm"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {listing.isActive && (
                        <button
                          id={`deactivate-${listing._id}`}
                          onClick={() => setDeactivateTarget(listing)}
                          className="btn-ghost btn-sm text-red-500 hover:bg-red-50"
                          title="Deactivate"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <EditModal
          listing={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={fetchListings}
        />
      )}

      <ConfirmModal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Product?"
        message={`"${deactivateTarget?.productId?.name}" will be hidden from retailers. You can reactivate it later.`}
        confirmLabel="Deactivate"
        danger
        loading={deactivateLoading}
      />
    </div>
  )
}
