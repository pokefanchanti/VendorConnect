import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('vc_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('vc_token')
      const storedUser  = localStorage.getItem('vc_user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = (data) => {
    const { token, user } = data
    localStorage.setItem('vc_token', token)
    localStorage.setItem('vc_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('vc_token')
    localStorage.removeItem('vc_user')
    setToken(null)
    setUser(null)
  }

  const isSupplier = () => user?.role === 'supplier'
  const isRetailer = () => user?.role === 'retailer'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isSupplier, isRetailer }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
