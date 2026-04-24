import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackagePlus, ArrowLeft } from 'lucide-react'
import { supplierApi } from '../../api'
import { FormInput, FormSelect, PageHeader } from '../../components/ui'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Electronics','Clothing & Apparel','Food & Beverages','Industrial Supplies',
  'Office Supplies','Packaging Materials','Raw Materials','Chemicals',
  'Automotive Parts','Furniture','Healthcare','Other',
]
const UNITS = ['piece','kg','gram','litre','ml','box','carton','bag','roll','meter','set','dozen']

export default function AddProduct() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name:'', description:'', category:'', unit:'', imageUrl:'',
    price:'', stock:'', minOrderQty:'1',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Product name is required.'
    if (!form.category) e.category = 'Category is required.'
    if (!form.unit) e.unit = 'Unit is required.'
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price.'
    if (form.stock === '' || Number(form.stock) < 0) e.stock = 'Enter a valid stock quantity.'
    if (!form.minOrderQty || Number(form.minOrderQty) < 1) e.minOrderQty = 'Min order qty must be >= 1.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      await supplierApi.addProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        minOrderQty: Number(form.minOrderQty),
      })
      toast.success('Product added successfully!')
      navigate('/supplier/products')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Add New Product"
        subtitle="Create a new listing for retailers to browse."
        action={
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        }
      />
      <div className="max-w-2xl">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-700">Product Details</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card-body space-y-5">
              <FormInput id="product-name" label="Product Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Industrial Cotton Fabric" error={errors.name} />
              <div className="form-group">
                <label htmlFor="description" className="label">Description</label>
                <textarea id="description" name="description" className="input" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the product..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect id="category" label="Category *" name="category" value={form.category} onChange={handleChange} error={errors.category}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </FormSelect>
                <FormSelect id="unit" label="Unit *" name="unit" value={form.unit} onChange={handleChange} error={errors.unit}>
                  <option value="">Select unit</option>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </FormSelect>
              </div>
              <FormInput id="imageUrl" label="Image URL (optional)" name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Pricing & Inventory</h2>
            </div>
            <div className="card-body space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <FormInput id="price" label="Price (Rs.) *" name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" min={0} step="0.01" error={errors.price} />
                <FormInput id="stock" label="Stock Qty *" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" min={0} error={errors.stock} />
                <FormInput id="minOrderQty" label="Min. Order Qty *" name="minOrderQty" type="number" value={form.minOrderQty} onChange={handleChange} placeholder="1" min={1} error={errors.minOrderQty} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} id="add-product-submit">
                  <PackagePlus className="w-4 h-4" />
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
