import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { IssueStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Boxes, Wrench, AlertTriangle, CheckCircle2, Users, DollarSign } from 'lucide-react'

function StatCard({ label, value, icon: Icon, tone = 'text-primary' }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 py-4">
                <div className={`flex size-10 items-center justify-center rounded-lg bg-muted ${tone}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-2xl font-semibold leading-tight">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function AdminDashboard() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        api.get('/dashboard/stats').then((res) => setStats(res.data)).catch(() => { })
    }, [])

    if (!stats) {
        return (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Total Assets" value={stats.totalAssets} icon={Boxes} />
                <StatCard label="Open Issues" value={stats.openIssues} icon={Wrench} tone="text-amber-600" />
                <StatCard label="Critical Issues" value={stats.criticalIssues} icon={AlertTriangle} tone="text-red-600" />
                <StatCard label="Resolved This Month" value={stats.resolvedThisMonth} icon={CheckCircle2} tone="text-emerald-600" />
                <StatCard label="Operational Assets" value={stats.operationalAssets} icon={Boxes} tone="text-emerald-600" />
                <StatCard label="Out of Service" value={stats.outOfServiceAssets} icon={AlertTriangle} tone="text-red-600" />
                <StatCard label="Technicians" value={stats.totalTechnicians} icon={Users} />
                <StatCard label="Maintenance Cost" value={`Rs. ${stats.totalMaintenanceCost.toLocaleString()}`} icon={DollarSign} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="text-base">Assets by Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {stats.assetsByStatus.map((s) => (
                            <div key={s._id} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{s._id}</span>
                                <span className="font-medium">{s.count}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Top Failing Assets</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {stats.topFailingAssets.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
                        {stats.topFailingAssets.map((a) => (
                            <div key={a._id} className="flex items-center justify-between text-sm">
                                <span>{a.name} <span className="text-muted-foreground">({a.assetCode})</span></span>
                                <span className="font-medium">{a.count} issues</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function TechnicianDashboard() {
    const [stats, setStats] = useState(null)

    useEffect(() => {
        api.get('/dashboard/technician').then((res) => setStats(res.data)).catch(() => { })
    }, [])

    if (!stats) {
        return (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Assigned to Me" value={stats.assigned} icon={Wrench} />
                <StatCard label="In Progress" value={stats.inProgress} icon={Wrench} tone="text-orange-600" />
                <StatCard label="Critical" value={stats.criticalAssigned} icon={AlertTriangle} tone="text-red-600" />
                <StatCard label="Resolved by Me" value={stats.resolvedByMe} icon={CheckCircle2} tone="text-emerald-600" />
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Recent Issues</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {stats.recentIssues.length === 0 && <p className="text-sm text-muted-foreground">No issues assigned yet</p>}
                    {stats.recentIssues.map((issue) => (
                        <Link
                            key={issue._id}
                            to={`/issues/${issue._id}`}
                            className="flex items-center justify-between rounded-md border border-border p-3 text-sm hover:bg-muted/50"
                        >
                            <div>
                                <p className="font-medium">{issue.title}</p>
                                <p className="text-xs text-muted-foreground">{issue.asset?.name} &middot; {issue.issueNumber}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <PriorityBadge priority={issue.priority} />
                                <IssueStatusBadge status={issue.status} />
                            </div>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

function UserDashboard() {
    const { user } = useAuth()
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Welcome, {user?.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Scan an asset's QR code to report a new issue, or check your existing reports.</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Link to="/my-reports" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80">
                            View My Reports
                        </Link>
                        <Link to="/track-issue" className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                            Track an Issue
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()

    if (user?.role === 'superadmin') return <AdminDashboard />
    if (user?.role === 'technician') return <TechnicianDashboard />
    return <UserDashboard />
}