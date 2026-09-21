import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AssetStatusBadge } from '@/components/StatusBadge'
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/lib/constants'
import { Plus, Search, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = {
    name: '', category: '', location: '', description: '', model: '',
    serialNumber: '', manufacturer: '', condition: 'Good',
}

export default function AssetList() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [assets, setAssets] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [createOpen, setCreateOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (statusFilter !== 'all') params.set('status', statusFilter)
            const res = await api.get(`/assets?${params.toString()}`)
            setAssets(res.data.assets)
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
    }, [search, statusFilter])

    const handleCreate = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/assets', form)
            toast.success('Asset registered — QR code generated')
            setCreateOpen(false)
            setForm(emptyForm)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search assets..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search assets"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-44 cursor-pointer"><SelectValue placeholder="All statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem className="cursor-pointer" value="all">All statuses</SelectItem>
                            {ASSET_STATUSES.map((s) => (
                                <SelectItem className="cursor-pointer" key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {user.role === 'superadmin' && (
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="size-4" /> New Asset
                        </Button>
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
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Technician</TableHead>
                                <TableHead className="text-right">QR</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.length === 0 && (
                                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No assets found</TableCell></TableRow>
                            )}
                            {assets.map((asset) => (
                                <TableRow
                                    key={asset._id}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/assets/${asset._id}`)}
                                >
                                    <TableCell className="font-mono text-xs text-primary">{asset.assetCode}</TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.category}</TableCell>
                                    <TableCell>{asset.location}</TableCell>
                                    <TableCell><AssetStatusBadge status={asset.status} /></TableCell>
                                    <TableCell>{asset.assignedTechnician?.name || '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`View QR code for ${asset.name}`}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/assets/${asset._id}`)
                                            }}
                                        >
                                            <QrCode className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Register New Asset</DialogTitle>
                        <DialogDescription>A unique asset code and QR code will be generated automatically.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="asset-name">Asset Name *</Label>
                                <Input id="asset-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="asset-category">Category *</Label>
                                <Input id="asset-category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Electronics" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="asset-location">Location *</Label>
                                <Input id="asset-location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Room 204" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="asset-model">Model</Label>
                                <Input id="asset-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="asset-serial">Serial Number</Label>
                                <Input id="asset-serial" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="asset-manufacturer">Manufacturer</Label>
                                <Input id="asset-manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="asset-condition">Condition</Label>
                                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                                    <SelectTrigger id="asset-condition" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {ASSET_CONDITIONS.map((c) => <SelectItem className="cursor-pointer" key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor="asset-description">Description</Label>
                                <Textarea id="asset-description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Asset'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}