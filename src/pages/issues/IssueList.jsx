import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { IssueStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { ISSUE_STATUSES, ISSUE_PRIORITIES } from '@/lib/constants'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IssueList() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [priority, setPriority] = useState('all')
    const [showAll, setShowAll] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (status !== 'all') params.set('status', status)
            if (priority !== 'all') params.set('priority', priority)
            if (showAll) params.set('all', 'true')
            const res = await api.get(`/issues?${params.toString()}`)
            setIssues(res.data.issues)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const t = setTimeout(load, 300)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, status, priority, showAll])

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search issues..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search issues"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-44 cursor-pointer"><SelectValue placeholder="All statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem className="cursor-pointer" value="all">All statuses</SelectItem>
                            {ISSUE_STATUSES.map((s) => <SelectItem className="cursor-pointer" key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="w-36 cursor-pointer"><SelectValue placeholder="All priorities" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem className="cursor-pointer" value="all">All priorities</SelectItem>
                            {ISSUE_PRIORITIES.map((p) => <SelectItem className="cursor-pointer" key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {user.role === 'technician' && (
                        <button
                            onClick={() => setShowAll((v) => !v)}
                            className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                            {showAll ? 'Showing: All Issues' : 'Showing: My Issues'}
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Issue #</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Reported</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.length === 0 && (
                                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No issues found</TableCell></TableRow>
                            )}
                            {issues.map((issue) => (
                                <TableRow
                                    key={issue._id}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/issues/${issue._id}`)}
                                >
                                    <TableCell className="font-mono text-xs text-primary">{issue.issueNumber}</TableCell>
                                    <TableCell className="max-w-52 truncate">{issue.title}</TableCell>
                                    <TableCell>{issue.asset?.name}</TableCell>
                                    <TableCell><PriorityBadge priority={issue.priority} /></TableCell>
                                    <TableCell><IssueStatusBadge status={issue.status} /></TableCell>
                                    <TableCell>{issue.assignedTo?.name || '—'}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}