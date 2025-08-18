import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../utils/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [profile, setProfile] = useState(() => {
    const raw = localStorage.getItem('profile')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (profile) localStorage.setItem('profile', JSON.stringify(profile))
    else localStorage.removeItem('profile')
  }, [profile])

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    setToken(data.token)
    setProfile(data.profile)
    return data
  }

  const logout = () => {
    setToken('')
    setProfile(null)
  }

  const value = useMemo(() => ({
    token, profile,
    isAuthenticated: !!token,
    login, logout
  }), [token, profile])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
