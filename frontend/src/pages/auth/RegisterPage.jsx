import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShoppingBag, Truck } from 'lucide-react'
import { authApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FormInput } from '../../components/ui'
import Logo from '../../components/ui/Logo'

const ROLES = [
  {
    value: 'retailer',
    label: 'Retailer',
    desc: 'Browse products and place orders',
    icon: ShoppingBag,
    color: 'sky',
  },
  {
    value: 'supplier',
    label: 'Supplier',
    desc: 'List products and fulfill orders',
    icon: Truck,
    color: 'violet',
  },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', phone: '', role: 'retailer',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register(form)
      login(res.data.data)
      toast.success('Account created! Welcome to VendorConnect.')
      navigate(form.role === 'supplier' ? '/supplier/dashboard' : '/retailer/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo variant="auth" />
          <p className="text-secondary-500 text-sm mt-4">Join VendorConnect today</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* Role selection */}
              <div>
                <p className="label mb-2">I am a…</p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(({ value, label, desc, icon: Icon }) => (
                    <label
                      key={value}
                      className={`relative flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.role === value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={form.role === value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 ${form.role === value ? 'text-primary-600' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${form.role === value ? 'text-primary-700' : 'text-slate-700'}`}>
                        {label}
                      </span>
                      <span className="text-xs text-slate-500">{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <FormInput
                id="name"
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
              <FormInput
                id="businessName"
                label="Business name (optional)"
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Your company or shop name"
              />
              <FormInput
                id="reg-email"
                label="Email address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
              <FormInput
                id="phone"
                label="Phone number (optional)"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
              <div className="form-group">
                <label htmlFor="reg-password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full btn-lg mt-2"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
