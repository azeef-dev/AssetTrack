import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { Dialog, DialogContent } from '@/components/ui/dialog'

const TITLES = {
    '/dashboard': 'Dashboard',
    '/assets': 'Assets',
    '/issues': 'Issues',
    '/users': 'User Management',
    '/my-reports': 'My Reports',
    '/track-issue': 'Track Issue',
}

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    const title = Object.entries(TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] || 'AssetTrack'

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
                <DialogContent className="left-0 top-0 h-full max-h-full w-64 max-w-64 translate-x-0 translate-y-0 rounded-none p-0 sm:max-w-64">
                    <Sidebar onNavigate={() => setMobileOpen(false)} />
                </DialogContent>
            </Dialog>

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}