import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, Boxes, Wrench, Users, ClipboardList, QrCode, X,
} from 'lucide-react'

const NAV_ITEMS = {
    superadmin: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/assets', label: 'Assets', icon: Boxes },
        { to: '/issues', label: 'Issues', icon: Wrench },
        { to: '/users', label: 'Users', icon: Users },
    ],
    technician: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/issues', label: 'My Issues', icon: Wrench },
        { to: '/assets', label: 'Assets', icon: Boxes },
    ],
    user: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/my-reports', label: 'My Reports', icon: ClipboardList },
        { to: '/track-issue', label: 'Track Issue', icon: QrCode },
    ],
}

export default function Sidebar({ onNavigate }) {
    const { user } = useAuth()
    const items = NAV_ITEMS[user?.role] || []

    return (
        <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
            <div className="flex items-center gap-2 px-5 py-5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading text-sm font-bold">
                    A
                </div>
                <div>
                    <p className="font-heading text-sm font-semibold leading-tight">AssetTrack</p>
                    <p className="text-xs text-muted-foreground leading-tight">Asset Maintenance</p>
                </div>
                <button
                    onClick={onNavigate}
                    className="ml-auto cursor-pointer text-muted-foreground hover:text-foreground md:hidden"
                >
                    <X className="size-4" />
                </button>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            cn(
                                'flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                            )
                        }
                    >
                        <item.icon className="size-4" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                Logged in as <span className="font-medium capitalize">{user?.role}</span>
            </div>
        </div>
    )
}