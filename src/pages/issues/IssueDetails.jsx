import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api, fileUrl } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { IssueStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { ISSUE_STATUS_FLOW, ASSET_CONDITIONS } from '@/lib/constants'
import { ArrowLeft, Plus, Trash2, Sparkles, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyMaintenance = {
    inspectionFindings: '', actionsPerformed: '', conditionAfter: '',
    timeSpentMinutes: '', nextServiceDate: '', notes: '',
    partsUsed: [],
}

export default function IssueDetails() {
    const { id } = useParams()
    const { user } = useAuth()
    const isAdmin = user.role === 'superadmin'

    const [issue, setIssue] = useState(null)
    const [records, setRecords] = useState([])
    const [technicians, setTechnicians] = useState([])
    const [loading, setLoading] = useState(true)

    const [assignOpen, setAssignOpen] = useState(false)
    const [selectedTech, setSelectedTech] = useState('')
    const [assigning, setAssigning] = useState(false)

    const [maintOpen, setMaintOpen] = useState(false)
    const [maintForm, setMaintForm] = useState(emptyMaintenance)
    const [savingMaint, setSavingMaint] = useState(false)
    const [aiSummaryLoading, setAiSummaryLoading] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const [issueRes, recordsRes] = await Promise.all([
                api.get(`/issues/${id}`),
                api.get(`/maintenance/issue/${id}`),
            ])
            setIssue(issueRes.data)
            setRecords(recordsRes.data)
            if (isAdmin) {
                const techRes = await api.get('/users/technicians')
                setTechnicians(techRes.data)
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    const canUpdate = isAdmin || (user.role === 'technician' && issue?.assignedTo?._id === user._id)
    const nextStatuses = issue ? (ISSUE_STATUS_FLOW[issue.status] || []) : []

    const changeStatus = async (status) => {
        try {
            await api.put(`/issues/${id}/status`, { status })
            toast.success(`Status updated to ${status}`)
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const handleAssign = async (e) => {
        e.preventDefault()
        if (!selectedTech) return
        setAssigning(true)
        try {
            await api.put(`/issues/${id}/assign`, { technicianId: selectedTech })
            toast.success('Technician assigned')
            setAssignOpen(false)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setAssigning(false)
        }
    }

    const handleReopen = async () => {
        try {
            await api.put(`/issues/${id}/reopen`, { reason: 'Reopened by admin' })
            toast.success('Issue reopened')
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const addPart = () => setMaintForm((f) => ({ ...f, partsUsed: [...f.partsUsed, { name: '', quantity: 1, cost: 0 }] }))
    const removePart = (i) => setMaintForm((f) => ({ ...f, partsUsed: f.partsUsed.filter((_, idx) => idx !== i) }))
    const updatePart = (i, key, value) => setMaintForm((f) => ({
        ...f,
        partsUsed: f.partsUsed.map((p, idx) => idx === i ? { ...p, [key]: value } : p),
    }))

    const getAiSummary = async () => {
        setAiSummaryLoading(true)
        try {
            const res = await api.post('/ai/summary', {
                notes: maintForm.notes,
                actionsPerformed: maintForm.actionsPerformed,
                partsUsed: maintForm.partsUsed,
            })
            setMaintForm((f) => ({ ...f, notes: res.data.summary }))
            toast.success(res.data.source === 'ai' ? 'AI summary generated' : 'Summary generated (built-in template)')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setAiSummaryLoading(false)
        }
    }

    const submitMaintenance = async (e) => {
        e.preventDefault()
        setSavingMaint(true)
        try {
            await api.post('/maintenance', {
                issueId: id,
                ...maintForm,
                partsUsed: JSON.stringify(maintForm.partsUsed),
            })
            toast.success('Maintenance record added')
            setMaintOpen(false)
            setMaintForm(emptyMaintenance)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSavingMaint(false)
        }
    }

    if (loading || !issue) {
        return <div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 w-full" /></div>
    }

    return (
        <div className="space-y-4">
            <Link to="/issues" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-3.5" /> Back to issues
            </Link>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <CardTitle>{issue.title}</CardTitle>
                                <CardDescription>{issue.issueNumber} &middot; <Link to={`/assets/${issue.asset?._id}`} className="text-primary hover:underline">{issue.asset?.name}</Link></CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <PriorityBadge priority={issue.priority} />
                                <IssueStatusBadge status={issue.status} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm">{issue.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-muted-foreground">Category:</span> {issue.category}</div>
                            <div><span className="text-muted-foreground">Reported by:</span> {issue.reportedBy?.name || issue.guestReporter?.name || 'Guest'}</div>
                            <div><span className="text-muted-foreground">Assigned to:</span> {issue.assignedTo?.name || 'Unassigned'}</div>
                            <div><span className="text-muted-foreground">Reported:</span> {new Date(issue.createdAt).toLocaleString()}</div>
                        </div>

                        {issue.evidence?.length > 0 && (
                            <div>
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Evidence</p>
                                <div className="flex flex-wrap gap-2">
                                    {issue.evidence.map((ev, i) => (
                                        <a key={i} href={fileUrl(ev)} target="_blank" rel="noreferrer" className="cursor-pointer">
                                            <img src={fileUrl(ev)} alt={`Evidence ${i + 1}`} className="size-16 rounded-md border border-border object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {issue.aiSuggestion?.category && (
                            <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
                                <p className="mb-1 font-medium text-primary">
                                    {issue.aiSuggestion.source === 'ai' ? 'AI Triage' : 'Rule-based Triage'} {issue.aiWasEdited && '(edited by reporter)'}
                                </p>
                                {issue.aiSuggestion.possibleCauses?.length > 0 && (
                                    <p className="text-muted-foreground">Causes: {issue.aiSuggestion.possibleCauses.join(', ')}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {isAdmin && (
                            <Button variant="outline" className="w-full" onClick={() => setAssignOpen(true)}>
                                {issue.assignedTo ? 'Reassign Technician' : 'Assign Technician'}
                            </Button>
                        )}

                        {canUpdate && nextStatuses.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-xs font-medium text-muted-foreground">Move to:</p>
                                {nextStatuses.map((s) => (
                                    <Button key={s} variant="secondary" size="sm" className="w-full justify-start" onClick={() => changeStatus(s)}>
                                        {s}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {canUpdate && !['Resolved', 'Closed'].includes(issue.status) && (
                            <Button variant="outline" className="w-full" onClick={() => setMaintOpen(true)}>
                                <Plus className="size-4" /> Add Maintenance Record
                            </Button>
                        )}

                        {isAdmin && ['Resolved', 'Closed'].includes(issue.status) && (
                            <Button variant="outline" className="w-full" onClick={handleReopen}>
                                <RotateCcw className="size-4" /> Reopen Issue
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Maintenance Records</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {records.length === 0 && <p className="text-sm text-muted-foreground">No maintenance records yet</p>}
                    {records.map((r) => (
                        <div key={r._id} className="rounded-md border border-border p-3 text-sm">
                            <div className="mb-1.5 flex items-center justify-between">
                                <p className="font-medium">{r.technician?.name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                            </div>
                            {r.inspectionFindings && <p className="text-muted-foreground"><span className="font-medium text-foreground">Findings:</span> {r.inspectionFindings}</p>}
                            {r.actionsPerformed && <p className="text-muted-foreground"><span className="font-medium text-foreground">Actions:</span> {r.actionsPerformed}</p>}
                            {r.partsUsed?.length > 0 && (
                                <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Parts:</span> {r.partsUsed.map((p) => `${p.name} x${p.quantity}`).join(', ')} — total Rs. {r.totalCost}
                                </p>
                            )}
                            {r.notes && <p className="mt-1 italic text-muted-foreground">"{r.notes}"</p>}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Assign Technician</DialogTitle></DialogHeader>
                    <form onSubmit={handleAssign} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="assign-technician">Technician</Label>
                            <Select value={selectedTech} onValueChange={setSelectedTech}>
                                <SelectTrigger id="assign-technician" className="w-full cursor-pointer"><SelectValue placeholder="Select a technician" /></SelectTrigger>
                                <SelectContent>
                                    {technicians.map((t) => <SelectItem className="cursor-pointer" key={t._id} value={t._id}>{t.name} — {t.email}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={assigning || !selectedTech}>{assigning ? 'Assigning...' : 'Assign'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={maintOpen} onOpenChange={setMaintOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Maintenance Record</DialogTitle>
                        <DialogDescription>Required before an issue can be marked Resolved.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitMaintenance} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="maint-findings">Inspection Findings</Label>
                            <Textarea id="maint-findings" rows={2} value={maintForm.inspectionFindings} onChange={(e) => setMaintForm({ ...maintForm, inspectionFindings: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="maint-actions">Actions Performed</Label>
                            <Textarea id="maint-actions" rows={2} value={maintForm.actionsPerformed} onChange={(e) => setMaintForm({ ...maintForm, actionsPerformed: e.target.value })} />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label>Parts Used</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={addPart}><Plus className="size-3.5" /> Add part</Button>
                            </div>
                            {maintForm.partsUsed.map((p, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input aria-label="Part name" placeholder="Part name" value={p.name} onChange={(e) => updatePart(i, 'name', e.target.value)} className="flex-1" />
                                    <Input aria-label="Quantity" type="number" min="1" placeholder="Qty" value={p.quantity} onChange={(e) => updatePart(i, 'quantity', Number(e.target.value))} className="w-16" />
                                    <Input aria-label="Cost" type="number" min="0" placeholder="Cost" value={p.cost} onChange={(e) => updatePart(i, 'cost', Number(e.target.value))} className="w-20" />
                                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove part" onClick={() => removePart(i)}><Trash2 className="size-3.5" /></Button>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="maint-condition">Condition After</Label>
                                <Select value={maintForm.conditionAfter} onValueChange={(v) => setMaintForm({ ...maintForm, conditionAfter: v })}>
                                    <SelectTrigger id="maint-condition" className="w-full cursor-pointer"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>{ASSET_CONDITIONS.map((c) => <SelectItem className="cursor-pointer" key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="maint-time">Time Spent (min)</Label>
                                <Input id="maint-time" type="number" min="0" value={maintForm.timeSpentMinutes} onChange={(e) => setMaintForm({ ...maintForm, timeSpentMinutes: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="maint-next-service">Next Service Date</Label>
                            <Input id="maint-next-service" type="date" value={maintForm.nextServiceDate} onChange={(e) => setMaintForm({ ...maintForm, nextServiceDate: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="maint-notes">Technician Notes</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={getAiSummary} disabled={aiSummaryLoading}>
                                    <Sparkles className="size-3.5" /> {aiSummaryLoading ? 'Generating...' : 'AI polish'}
                                </Button>
                            </div>
                            <Textarea id="maint-notes" rows={3} value={maintForm.notes} onChange={(e) => setMaintForm({ ...maintForm, notes: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setMaintOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={savingMaint}>{savingMaint ? 'Saving...' : 'Save Record'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}