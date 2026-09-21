import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'

export default function Topbar({ onMenuClick, title }) {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
            <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onMenuClick}>
                <Menu className="size-4" />
            </Button>

            <h1 className="font-heading text-sm font-semibold text-foreground">{title}</h1>

            <div className="ml-auto" ref={ref}>
                <div className="relative">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                    >
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserIcon className="size-3.5" />
                        </div>
                        <span className="hidden font-medium sm:inline">{user?.name}</span>
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                    </button>

                    {open && (
                        <div className="absolute right-0 top-full z-50 mt-1.5 w-48 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md">
                            <div className="px-2.5 py-1.5 text-xs text-muted-foreground">
                                {user?.email}
                            </div>
                            <div className="my-1 h-px bg-border" />
                            <button
                                onClick={() => {
                                    setOpen(false)
                                    logout()
                                    navigate('/login')
                                }}
                                className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="size-3.5" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}