import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
            <Search className="size-10 text-muted-foreground" />
            <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
            <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
            <Link to="/dashboard">
                <Button className="mt-2">Back to Dashboard</Button>
            </Link>
        </div>
    )
}