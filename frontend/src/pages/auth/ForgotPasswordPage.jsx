import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simulate API call since forgot password isn't in authApi currently
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('If an account with that email exists, a reset link has been sent.')
      setEmail('')
    } catch (err) {
      toast.error('Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen font-body-md text-[#2b2826] flex items-center justify-center p-4 antialiased w-full relative overflow-hidden">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f4f3ec] rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-[#f9eee6] rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <h1 className="font-h1 text-3xl font-bold tracking-tight text-[#2b2826]">
              VendorConnect
            </h1>
          </Link>
          <h2 className="font-h1 text-4xl text-[#2b2826] font-bold tracking-tight mb-3">
            Reset Password
          </h2>
          <p className="text-lg text-[#2b2826]/60 font-medium max-w-sm mx-auto">
            Don't worry, it happens to the best of us. We'll send you a reset link.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-[#2b2826]/5 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label htmlFor="email" className="block font-label-sm text-sm font-bold text-[#2b2826]/80 px-4">
                Email Address
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 text-[#2b2826] bg-[#faf9f6] border border-transparent rounded-full focus:ring-2 focus:ring-[#2b2826]/20 focus:bg-white transition-all shadow-sm outline-none placeholder:text-[#2b2826]/30 font-medium"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 text-white font-bold bg-[#2b2826] hover:bg-black focus:ring-4 focus:ring-[#2b2826]/30 focus:outline-none rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 font-bold text-[#2b2826]/60 hover:text-[#2b2826] transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Back to Log in
          </Link>
        </div>
        
      </div>
    </div>
  )
}
