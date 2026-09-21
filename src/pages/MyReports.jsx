import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { IssueStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import toast from 'react-hot-toast'

export default function MyReports() {
    const navigate = useNavigate()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/issues')
            .then((res) => setIssues(res.data.issues))
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
    }

    if (issues.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    You haven't reported any issues yet. Scan an asset's QR code to report one.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="rounded-lg border border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Issue #</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reported</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {issues.map((issue) => (
                        <TableRow
                            key={issue._id}
                            className="cursor-pointer"
                            onClick={() => navigate(`/track-issue?issueNumber=${issue.issueNumber}`)}
                        >
                            <TableCell className="font-mono text-xs text-primary">{issue.issueNumber}</TableCell>
                            <TableCell className="max-w-52 truncate">{issue.title}</TableCell>
                            <TableCell>{issue.asset?.name}</TableCell>
                            <TableCell><PriorityBadge priority={issue.priority} /></TableCell>
                            <TableCell><IssueStatusBadge status={issue.status} /></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(issue.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}