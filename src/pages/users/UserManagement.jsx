import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyForm = { name: '', email: '', password: '', role: 'technician', phone: '', department: '' }

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [saving, setSaving] = useState(false)

    const load = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            const res = await api.get(`/users?${params.toString()}`)
            setUsers(res.data.users)
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
    }, [search])

    const handleCreate = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await api.post('/users', form)
            toast.success('User created')
            setCreateOpen(false)
            setForm(emptyForm)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const toggleActive = async (u) => {
        try {
            if (u.isActive) {
                await api.del(`/users/${u._id}`)
            } else {
                await api.put(`/users/${u._id}`, { isActive: true })
            }
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const changeRole = async (u, role) => {
        try {
            await api.put(`/users/${u._id}`, { role })
            toast.success('Role updated')
            load()
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search users..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
                </div>
                <Button onClick={() => setCreateOpen(true)}><Plus className="size-4" /> New User</Button>
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
                <div className="rounded-lg border border-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u._id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell>
                                        <Select value={u.role} onValueChange={(v) => changeRole(u, v)}>
                                            <SelectTrigger size="sm" className="w-32 cursor-pointer" aria-label={`Change role for ${u.name}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem className="cursor-pointer" value="superadmin">Super Admin</SelectItem>
                                                <SelectItem className="cursor-pointer" value="technician">Technician</SelectItem>
                                                <SelectItem className="cursor-pointer" value="user">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={u.isActive ? 'default' : 'destructive'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => toggleActive(u)}>
                                            {u.isActive ? 'Deactivate' : 'Reactivate'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="user-name">Name</Label>
                            <Input id="user-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="user-email">Email</Label>
                            <Input id="user-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="user-password">Password</Label>
                            <Input id="user-password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="user-role">Role</Label>
                            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                                <SelectTrigger id="user-role" className="w-full cursor-pointer"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="cursor-pointer" value="superadmin">Super Admin</SelectItem>
                                    <SelectItem className="cursor-pointer" value="technician">Technician</SelectItem>
                                    <SelectItem className="cursor-pointer" value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="user-phone">Phone</Label>
                            <Input id="user-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create User'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}