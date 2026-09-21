import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedRoute({ roles, children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
                Loading...
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}