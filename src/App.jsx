import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'

import Login from '@/pages/Login'
import Register from '@/pages/Register'
import PublicAsset from '@/pages/PublicAsset'
import TrackIssue from '@/pages/TrackIssue'
import Dashboard from '@/pages/Dashboard'
import MyReports from '@/pages/MyReports'
import NotFound from '@/pages/NotFound'

import AssetList from '@/pages/assets/AssetList'
import AssetDetails from '@/pages/assets/AssetDetails'
import IssueList from '@/pages/issues/IssueList'
import IssueDetails from '@/pages/issues/IssueDetails'
import UserManagement from '@/pages/users/UserManagement'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/asset/:assetCode" element={<PublicAsset />} />
      <Route path="/track-issue" element={<TrackIssue />} />

      {/* Protected — shared layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/assets"
          element={<ProtectedRoute roles={['superadmin', 'technician']}><AssetList /></ProtectedRoute>}
        />
        <Route
          path="/assets/:id"
          element={<ProtectedRoute roles={['superadmin', 'technician']}><AssetDetails /></ProtectedRoute>}
        />

        <Route
          path="/issues"
          element={<ProtectedRoute roles={['superadmin', 'technician']}><IssueList /></ProtectedRoute>}
        />
        <Route
          path="/issues/:id"
          element={<ProtectedRoute roles={['superadmin', 'technician']}><IssueDetails /></ProtectedRoute>}
        />

        <Route
          path="/users"
          element={<ProtectedRoute roles={['superadmin']}><UserManagement /></ProtectedRoute>}
        />

        <Route
          path="/my-reports"
          element={<ProtectedRoute roles={['user']}><MyReports /></ProtectedRoute>}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App