import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  {
    value: 'retailer',
    label: 'Retailer',
    icon: 'storefront',
    desc: 'Browse & buy'
  },
  {
    value: 'supplier',
    label: 'Supplier',
    icon: 'factory',
    desc: 'List & sell'
  },
]

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', phone: '', role: 'retailer',
    city: '', district: '', state: '', pincode: ''
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
      const payload = {
        ...form,
        address: {
          city: form.city,
          district: form.district,
          state: form.state,
          pincode: form.pincode
        }
      }
      const res = await authApi.register(payload)
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
    <div className="bg-[#faf9f6] min-h-screen font-body-md text-[#2b2826] flex items-center justify-center p-4 antialiased w-full relative overflow-hidden">

      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f4f3ec] rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#f9eee6] rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <h1 className="font-h1 text-3xl font-bold tracking-tight text-[#2b2826]">
              VendorConnect
            </h1>
          </Link>
          <h2 className="font-h1 text-4xl text-[#2b2826] font-bold tracking-tight mb-3">
            Create Account
          </h2>
          <p className="text-lg text-[#2b2826]/60 font-medium">
            Join the platform and scale your operations.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-[#2b2826]/5 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
              <div className="bg-[#fdebea] border border-[#93000a]/20 text-[#93000a] rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-2">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                {ROLES.map(({ value, label, icon, desc }) => (
                  <label
                    key={value}
                    className={`relative flex items-center gap-4 p-4 rounded-3xl border-2 cursor-pointer transition-all duration-200 ${form.role === value
                      ? 'border-[#2b2826] bg-[#faf9f6]'
                      : 'border-[#2b2826]/10 hover:border-[#2b2826]/30 bg-white'
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${form.role === value ? 'bg-[#2b2826] text-white' : 'bg-[#f4f3ec] text-[#2b2826]/60'}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                      <span className={`block text-lg font-bold ${form.role === value ? 'text-[#2b2826]' : 'text-[#2b2826]/80'}`}>
                        {label}
                      </span>
                      <span className="block text-sm font-medium text-[#2b2826]/50">{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="businessName" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">store</span>
                  </div>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={form.businessName}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  Business Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">phone</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 9309890532"
                    value={form.phone}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label htmlFor="city" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">location_city</span>
                  </div>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={form.city}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="district" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  District
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">map</span>
                  </div>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    required
                    placeholder="Mumbai Suburban"
                    value={form.district}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label htmlFor="state" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  State
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">terrain</span>
                  </div>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="pincode" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                  Pincode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                    <span className="material-symbols-outlined text-xl">pin_drop</span>
                  </div>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    required
                    placeholder="400001"
                    value={form.pincode}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label htmlFor="password" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#2b2826]/40">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#2b2826]/40 hover:text-[#2b2826] transition-colors focus:outline-none">
                    <span className="material-symbols-outlined text-xl">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <p className="text-xs font-medium text-[#2b2826]/40 px-4 mt-1">Must be at least 6 characters.</p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 text-white font-bold bg-[#2b2826] hover:bg-black focus:ring-4 focus:ring-[#2b2826]/30 focus:outline-none rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[#2b2826]/60 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#2b2826] hover:underline transition-all ml-1">
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
