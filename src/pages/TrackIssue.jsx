import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IssueStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrackIssue() {
    const [searchParams] = useSearchParams()
    const [issueNumber, setIssueNumber] = useState(searchParams.get('issueNumber') || '')
    const [issue, setIssue] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!issueNumber.trim()) return
        setLoading(true)
        setSearched(true)
        try {
            const res = await api.public.get(`/issues/track/${issueNumber.trim().toUpperCase()}`)
            setIssue(res.data)
        } catch (err) {
            setIssue(null)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-start justify-center bg-muted/30 p-4 pt-16">
            <div className="w-full max-w-md space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Track Your Issue</CardTitle>
                        <CardDescription>Enter the issue number you received when reporting</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="issueNumber" className="sr-only">Issue Number</Label>
                                <Input
                                    id="issueNumber"
                                    placeholder="ISS-00001"
                                    value={issueNumber}
                                    onChange={(e) => setIssueNumber(e.target.value)}
                                />
                            </div>
                            <Button type="submit" disabled={loading}>
                                <Search className="size-4" />
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {issue && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{issue.title}</CardTitle>
                                <PriorityBadge priority={issue.priority} />
                            </div>
                            <CardDescription>{issue.issueNumber} &middot; {issue.asset?.name} ({issue.asset?.assetCode})</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <IssueStatusBadge status={issue.status} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Reported</span>
                                <span>{new Date(issue.createdAt).toLocaleString()}</span>
                            </div>
                            {issue.resolvedAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Resolved</span>
                                    <span>{new Date(issue.resolvedAt).toLocaleString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {searched && !issue && !loading && (
                    <p className="text-center text-sm text-muted-foreground">No issue found with that number.</p>
                )}

                <p className="text-center text-xs text-muted-foreground">
                    <Link to="/login" className="hover:underline">Back to login</Link>
                </p>
            </div>
        </div>
    )
}