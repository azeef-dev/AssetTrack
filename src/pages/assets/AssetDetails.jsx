import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AssetStatusBadge } from '@/components/StatusBadge'
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/lib/constants'
import { Download, ExternalLink, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AssetDetails() {
    const { id } = useParams()
    const { user } = useAuth()
    const isAdmin = user.role === 'superadmin'

    const [asset, setAsset] = useState(null)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState(null)
    const [saving, setSaving] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const [assetRes, historyRes] = await Promise.all([
                api.get(`/assets/${id}`),
                api.get(`/assets/${id}/history`),
            ])
            setAsset(assetRes.data)
            setForm({
                name: assetRes.data.name,
                category: assetRes.data.category,
                location: assetRes.data.location,
                condition: assetRes.data.condition,
                status: assetRes.data.status,
                model: assetRes.data.model || '',
                serialNumber: assetRes.data.serialNumber || '',
            })
            setHistory(historyRes.data)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await api.put(`/assets/${id}`, form)
            setAsset(res.data)
            setEditing(false)
            toast.success('Asset updated')
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const downloadQR = () => {
        const link = document.createElement('a')
        link.href = asset.qrCodeDataUrl
        link.download = `${asset.assetCode}-qr.png`
        link.click()
    }

    const publicUrl = `${window.location.origin}/asset/${asset?.assetCode}`

    if (loading || !asset) {
        return <div className="space-y-3"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 w-full" /></div>
    }

    return (
        <div className="space-y-4">
            <Link to="/assets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-3.5" /> Back to assets
            </Link>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{asset.name}</CardTitle>
                                <CardDescription>{asset.assetCode}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <AssetStatusBadge status={asset.status} />
                                {isAdmin && (
                                    <Button size="sm" variant="outline" onClick={() => setEditing((e) => !e)}>
                                        {editing ? 'Cancel' : 'Edit'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {editing ? (
                            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1.5">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Input id="edit-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input id="edit-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-condition">Condition</Label>
                                    <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                                        <SelectTrigger id="edit-condition" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                                        <SelectContent>{ASSET_CONDITIONS.map((c) => <SelectItem className="cursor-pointer" key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                        <SelectTrigger id="edit-status" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                                        <SelectContent>{ASSET_STATUSES.map((s) => <SelectItem className="cursor-pointer" key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-model">Model</Label>
                                    <Input id="edit-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-serial">Serial Number</Label>
                                    <Input id="edit-serial" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <Button type="submit" disabled={saving}><Save className="size-4" /> {saving ? 'Saving...' : 'Save changes'}</Button>
                                </div>
                            </form>
                        ) : (
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div><dt className="text-muted-foreground">Category</dt><dd>{asset.category}</dd></div>
                                <div><dt className="text-muted-foreground">Location</dt><dd>{asset.location}</dd></div>
                                <div><dt className="text-muted-foreground">Condition</dt><dd>{asset.condition}</dd></div>
                                <div><dt className="text-muted-foreground">Model</dt><dd>{asset.model || '—'}</dd></div>
                                <div><dt className="text-muted-foreground">Serial No.</dt><dd>{asset.serialNumber || '—'}</dd></div>
                                <div><dt className="text-muted-foreground">Technician</dt><dd>{asset.assignedTechnician?.name || '—'}</dd></div>
                                <div><dt className="text-muted-foreground">Last Service</dt><dd>{asset.lastServiceDate ? new Date(asset.lastServiceDate).toLocaleDateString() : '—'}</dd></div>
                                <div><dt className="text-muted-foreground">Next Service</dt><dd>{asset.nextServiceDate ? new Date(asset.nextServiceDate).toLocaleDateString() : '—'}</dd></div>
                            </dl>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">QR Code</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center gap-3">
                        {asset.qrCodeDataUrl ? (
                            <img src={asset.qrCodeDataUrl} alt={`QR code for ${asset.name}`} className="size-40 rounded-md border border-border" />
                        ) : (
                            <div className="flex size-40 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">No QR yet</div>
                        )}
                        <div className="flex w-full gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={downloadQR} disabled={!asset.qrCodeDataUrl}>
                                <Download className="size-3.5" /> Download
                            </Button>
                            <a href={`/asset/${asset.assetCode}`} target="_blank" rel="noreferrer" className="flex-1 cursor-pointer">
                                <Button variant="outline" size="sm" className="w-full">
                                    <ExternalLink className="size-3.5" /> Open
                                </Button>
                            </a>
                        </div>
                        <p className="break-all text-center text-xs text-muted-foreground">{publicUrl}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="text-base">Asset History</CardTitle></CardHeader>
                <CardContent>
                    {history.length === 0 && <p className="text-sm text-muted-foreground">No history yet</p>}
                    <ol className="space-y-3">
                        {history.map((h) => (
                            <li key={h._id} className="flex gap-3 border-l-2 border-border pl-3">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{h.action}</p>
                                    {h.details && <p className="text-xs text-muted-foreground">{h.details}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        {h.actor?.name || h.actorName || 'System'} &middot; {new Date(h.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
        </div>
    )
}