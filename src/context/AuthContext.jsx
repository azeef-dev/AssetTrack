import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const loadMe = useCallback(async () => {
        const token = localStorage.getItem('miq_token')
        if (!token) {
            setLoading(false)
            return
        }
        try {
            const res = await api.get('/auth/me')
            setUser(res.data)
        } catch {
            localStorage.removeItem('miq_token')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMe()
    }, [loadMe])

    const login = async (email, password) => {
        const res = await api.public.post('/auth/login', { email, password })
        localStorage.setItem('miq_token', res.data.token)
        setUser(res.data.user)
        return res.data.user
    }

    const register = async (payload) => {
        const res = await api.public.post('/auth/register', payload)
        localStorage.setItem('miq_token', res.data.token)
        setUser(res.data.user)
        return res.data.user
    }

    const logout = () => {
        localStorage.removeItem('miq_token')
        setUser(null)
        toast.success('Logged out')
    }

    const refreshUser = async () => {
        const res = await api.get('/auth/me')
        setUser(res.data)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components -- convenience hook lives alongside its Provider
export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}