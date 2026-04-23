import { useEffect, useState } from 'react'
import { Search, ShoppingCart, Filter, Package } from 'lucide-react'
import { productsApi, retailerApi } from '../../api'
import { PageHeader, Modal, Spinner, EmptyState, formatCurrency } from '../../components/ui'
import toast from 'react-hot-toast'

function ProductCard({ listing, onOrder }) {
  const product = listing.productId
  const supplier = listing.supplierId

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col">
      {/* Image / placeholder */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center overflow-hidden">
        {product?.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package className="w-12 h-12 text-slate-300" />
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
            {product?.category}
          </span>
          <h3 className="font-semibold text-slate-800 mt-2 leading-snug">{product?.name}</h3>
          {product?.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            by <span className="font-medium text-slate-600">{supplier?.businessName || supplier?.name}</span>
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(listing.price)}</p>
              <p className="text-xs text-slate-500">per {product?.unit}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{listing.stock} {product?.unit}</p>
              <p className="text-xs text-slate-400">in stock</p>
            </div>
          </div>
          <p className="text-xs text-amber-600 mb-3">Min. order: {listing.minOrderQty} {product?.unit}</p>
          <button
            className="btn-primary w-full"
            onClick={() => onOrder(listing)}
          >
            <ShoppingCart className="w-4 h-4" />
            Order Now
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderModal({ listing, open, onClose }) {
  const [qty, setQty] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (listing) setQty(listing.minOrderQty)
  }, [listing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await retailerApi.placeOrder({
        items: [{ supplierProductId: listing._id, quantity: Number(qty) }],
        notes,
      })
      toast.success('Order placed successfully!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  if (!listing) return null

  return (
    <Modal open={open} onClose={onClose} title="Place Order">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="font-semibold text-slate-800">{listing.productId?.name}</p>
          <p className="text-sm text-slate-500">
            {formatCurrency(listing.price)} / {listing.productId?.unit} &nbsp;·&nbsp;
            {listing.stock} available
          </p>
          <p className="text-xs text-amber-600 mt-1">Minimum: {listing.minOrderQty} {listing.productId?.unit}</p>
        </div>

        <div className="form-group">
          <label htmlFor="order-qty" className="label">
            Quantity ({listing.productId?.unit})
          </label>
          <input
            id="order-qty"
            type="number"
            className="input"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            min={listing.minOrderQty}
            max={listing.stock}
            required
          />
          {qty && (
            <p className="text-xs text-slate-500 mt-0.5">
              Total: <span className="font-semibold text-slate-700">{formatCurrency(listing.price * qty)}</span>
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="order-notes" className="label">Notes (optional)</label>
          <textarea
            id="order-notes"
            className="input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions…"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-700 font-medium">💵 Payment: Cash on Delivery (COD)</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Placing…' : 'Confirm Order'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function BrowseProducts() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [sortBy, setSortBy] = useState('price')
  const [order, setOrder] = useState('asc')
  const [selectedListing, setSelectedListing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await productsApi.browse({ search, category, sortBy, order })
      setListings(res.data.data.listings)
    } catch (err) {
      toast.error('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    productsApi.getCategories().then((res) => setCategories(res.data.data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [category, sortBy, order])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  const handleOrder = (listing) => {
    setSelectedListing(listing)
    setModalOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Browse Products"
        subtitle={`${listings.length} product${listings.length !== 1 ? 's' : ''} available`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input w-auto"
          id="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={`${sortBy}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-')
            setSortBy(s); setOrder(o)
          }}
          className="input w-auto"
          id="sort-filter"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="stock-desc">Stock: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Spinner className="h-10 w-10" /></div>
      ) : listings.length === 0 ? (
        <EmptyState icon={Package} title="No products found" subtitle="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ProductCard key={listing._id} listing={listing} onOrder={handleOrder} />
          ))}
        </div>
      )}

      <OrderModal
        listing={selectedListing}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedListing(null) }}
      />
    </div>
  )
}
