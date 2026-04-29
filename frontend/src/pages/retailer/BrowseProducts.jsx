import { useEffect, useState } from 'react'
import { Search, ShoppingCart, Filter, Package } from 'lucide-react'
import { productsApi, retailerApi } from '../../api'
import { PageHeader, Modal, Spinner, EmptyState, formatCurrency } from '../../components/ui'
import toast from 'react-hot-toast'

function getSupplierLabel(score) {
  if (score >= 90) return '🟢 Elite Supplier'
  if (score >= 75) return '🔵 Trusted Supplier'
  if (score >= 50) return '🟡 Average'
  return '🔴 Risky Supplier'
}

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
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              {product?.category}
            </span>
            {listing.supplierVScore && (
              <div className="flex gap-1 flex-wrap">
                {listing.supplierVScore.hasEnoughData ? (
                  <>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full" title="Average Rating">
                      ⭐ {listing.supplierVScore.displayRating?.toFixed(1)} ({listing.supplierVScore.totalReviews} reviews)
                    </span>
                    <span className="text-xs font-bold text-[#1c5c3e] bg-[#eaf1ed] px-1.5 py-0.5 rounded-full" title="Supplier V-Score">
                      🏆 {listing.supplierVScore.VScore}
                    </span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {getSupplierLabel(listing.supplierVScore.VScore)}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    No ratings yet
                  </span>
                )}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-slate-800 mt-2 leading-snug">{product?.name}</h3>
          {product?.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{product.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            by <span className="font-medium text-slate-600">{supplier?.businessName || supplier?.name}</span>
            {supplier?.address?.city && (
              <span className="text-slate-500 block mt-0.5">
                📍 {supplier.address.city}, {supplier.address.state}
              </span>
            )}
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
  const [deliveryTime, setDeliveryTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)

  useEffect(() => {
    if (listing) {
      setQty(listing.minOrderQty)
      setPlacedOrder(null)
      setDeliveryTime('')
    }
  }, [listing, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        items: [{ supplierProductId: listing._id, quantity: Number(qty) }],
        notes,
      };
      if (deliveryTime) payload.deliveryTime = deliveryTime;

      const res = await retailerApi.placeOrder(payload)
      setPlacedOrder(res.data.data.order)
      toast.success('Order placed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setLoading(false)
    }
  }

  if (!listing) return null

  if (placedOrder) {
    const { deliveryCost = 0, deliveryType = 'standard', totalAmount } = placedOrder;
    const itemsTotal = totalAmount - deliveryCost;
    
    return (
      <Modal open={open} onClose={onClose} title="Order Confirmed">
        <div className="space-y-4">
          <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 text-center">
            <span className="material-symbols-outlined text-4xl mb-2 font-bold text-green-600">check_circle</span>
            <p className="font-bold text-lg">Order Successfully Placed!</p>
            <p className="text-sm opacity-80 mt-1">Your order #{placedOrder._id.slice(-6).toUpperCase()} is now pending.</p>
          </div>

          <div className="bg-[#faf9f6] border border-[#2b2826]/10 p-5 rounded-xl space-y-2 text-[#2b2826]">
            <p className="font-bold mb-4">Order Summary</p>
            <div className="flex justify-between text-sm font-medium">
              <span>Items Total:</span>
              <span>{formatCurrency(itemsTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#2b2826]/60">
              <span>Delivery ({deliveryType}):</span>
              <span>{formatCurrency(deliveryCost)}</span>
            </div>
            <hr className="my-3 border-[#2b2826]/10" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <button type="button" className="btn-primary w-full mt-2" onClick={onClose}>
            Done
          </button>
        </div>
      </Modal>
    )
  }

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
          <label htmlFor="order-delivery" className="label">Requested Delivery (optional)</label>
          <input
            id="order-delivery"
            type="datetime-local"
            className="input"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
          />
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
  const [locationFilter, setLocationFilter] = useState('')
  const [vscoreFilter, setVscoreFilter] = useState('')
  const [selectedListing, setSelectedListing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = { 
        search, 
        category, 
        sortBy, 
        order,
        locationFilter: locationFilter || undefined
      }
      
      if (vscoreFilter === 'top_rated') params.minRating = 4;
      if (vscoreFilter === 'high_vscore') params.minVScore = 80;

      const res = await productsApi.browse(params)
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
  }, [category, sortBy, order, locationFilter, vscoreFilter])

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
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="input w-auto"
          id="location-filter"
        >
          <option value="">All Locations</option>
          <option value="city">Same City</option>
          <option value="district">Same District</option>
          <option value="state">Same State</option>
        </select>

        <select
          value={vscoreFilter}
          onChange={(e) => setVscoreFilter(e.target.value)}
          className="input w-auto"
          id="trust-filter"
        >
          <option value="">Trust Filter</option>
          <option value="top_rated">⭐ Top Rated (&gt; 4.0)</option>
          <option value="high_vscore">🏆 High V-Score (&gt; 80)</option>
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
          <option value="vscore-desc">🏆 Highest V-Score</option>
          <option value="rating-desc">⭐ Highest Rating</option>
        </select>
      </div>

      {locationFilter && (
        <div className="flex items-center gap-2 mb-6 bg-[#f4f3ec] text-[#2b2826] px-3 py-2 rounded-lg border border-[#2b2826]/10 w-max">
          <span className="text-sm font-medium">
            Filtering by: Same {locationFilter.charAt(0).toUpperCase() + locationFilter.slice(1)}
          </span>
          <button
            onClick={() => setLocationFilter('')}
            className="flex items-center justify-center p-1 hover:bg-[#2b2826]/10 rounded-full transition-colors"
            title="Clear Filter"
          >
            <span className="material-symbols-outlined text-sm font-bold">close</span>
          </button>
        </div>
      )}

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
