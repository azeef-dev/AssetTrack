import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AssetStatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { Sparkles, CheckCircle2, MapPin, Tag, Calendar, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PublicAsset() {
    const { assetCode } = useParams()
    const { user } = useAuth()
    const [asset, setAsset] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [description, setDescription] = useState('')
    const [aiSuggestion, setAiSuggestion] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [guest, setGuest] = useState({ guestName: '', guestEmail: '', guestPhone: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submittedIssue, setSubmittedIssue] = useState(null)

    useEffect(() => {
        setLoading(true)
        api.public.get(`/assets/public/${assetCode}`)
            .then((res) => setAsset(res.data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [assetCode])

    const runTriage = async () => {
        if (description.trim().length < 5) {
            toast.error('Please describe the problem in a bit more detail first')
            return
        }
        setAiLoading(true)
        try {
            const res = await api.public.post('/ai/triage', { description, assetCode })
            setAiSuggestion({ ...res.data, edited: false })
            toast.success(res.data.source === 'ai' ? 'AI suggestion ready' : 'Suggestion generated (built-in rules)')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setAiLoading(false)
        }
    }

    const submitIssue = async (e) => {
        e.preventDefault()
        if (!description.trim()) {
            toast.error('Please describe the problem')
            return
        }
        if (!user && (!guest.guestName || !guest.guestEmail)) {
            toast.error('Please provide your name and email')
            return
        }
        setSubmitting(true)
        try {
            const payload = {
                assetCode,
                description,
                title: aiSuggestion?.title,
                category: aiSuggestion?.category,
                priority: aiSuggestion?.priority,
                aiSuggestion: aiSuggestion ? JSON.stringify(aiSuggestion) : undefined,
                aiWasEdited: aiSuggestion?.edited || false,
                ...(!user ? guest : {}),
            }
            const res = await api.public.post('/issues', payload)
            setSubmittedIssue(res.data)
            toast.success('Issue reported successfully')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-lg space-y-4 p-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 text-center">
                <div>
                    <h1 className="mb-2 font-heading text-lg font-semibold">Asset not found</h1>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    if (submittedIssue) {
        return (
            <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center p-6 text-center">
                <CheckCircle2 className="mb-3 size-12 text-emerald-500" />
                <h1 className="font-heading text-xl font-semibold">Issue reported!</h1>
                <p className="mt-1 text-sm text-muted-foreground">Your issue number is</p>
                <p className="mt-1 font-heading text-2xl font-bold text-primary">{submittedIssue.issueNumber}</p>
                <p className="mt-3 text-sm text-muted-foreground">Save this number to check the status later.</p>
                <Link to={`/track-issue?issueNumber=${submittedIssue.issueNumber}`}>
                    <Button className="mt-4">Track this issue</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-10">
            <div className="mx-auto max-w-lg space-y-4 p-4 pt-8 sm:p-6">
                <div className="text-center">
                    <p className="font-heading text-xs font-semibold uppercase tracking-wide text-primary">AssetTrack</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg">{asset.name}</CardTitle>
                                <CardDescription>{asset.assetCode}</CardDescription>
                            </div>
                            <AssetStatusBadge status={asset.status} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="size-3.5" /> {asset.category} &middot; Condition: {asset.condition}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="size-3.5" /> {asset.location}
                        </div>
                        {asset.lastServiceDate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Wrench className="size-3.5" /> Last service: {new Date(asset.lastServiceDate).toLocaleDateString()}
                            </div>
                        )}
                        {asset.nextServiceDate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="size-3.5" /> Next service: {new Date(asset.nextServiceDate).toLocaleDateString()}
                            </div>
                        )}
                        {asset.recentActivity?.length > 0 && (
                            <div className="mt-3 border-t border-border pt-3">
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Recent activity</p>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                    {asset.recentActivity.slice(0, 4).map((h, i) => (
                                        <li key={i}>&bull; {h.action} — {new Date(h.date).toLocaleDateString()}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {asset.isRetired ? (
                    <Card>
                        <CardContent className="py-6 text-center text-sm text-muted-foreground">
                            This asset has been retired and can no longer receive new issue reports.
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Report an issue</CardTitle>
                            <CardDescription>Describe the problem — our AI will help triage it</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitIssue} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="description">What's wrong?</Label>
                                    <Textarea
                                        id="description"
                                        required
                                        rows={4}
                                        placeholder="e.g. The projector display is flickering and sometimes doesn't detect HDMI..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <Button type="button" variant="outline" onClick={runTriage} disabled={aiLoading} className="w-full">
                                    <Sparkles className="size-4" />
                                    {aiLoading ? 'Analyzing...' : 'Get AI suggestion'}
                                </Button>

                                {aiSuggestion && (
                                    <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-medium text-primary">
                                                {aiSuggestion.source === 'ai' ? 'AI Suggestion' : 'Suggested (built-in rules)'}
                                            </p>
                                            <PriorityBadge priority={aiSuggestion.priority} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="ai-title" className="text-xs">Title</Label>
                                            <Input
                                                id="ai-title"
                                                value={aiSuggestion.title}
                                                onChange={(e) => setAiSuggestion({ ...aiSuggestion, title: e.target.value, edited: true })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="ai-category" className="text-xs">Category</Label>
                                            <Input
                                                id="ai-category"
                                                value={aiSuggestion.category}
                                                onChange={(e) => setAiSuggestion({ ...aiSuggestion, category: e.target.value, edited: true })}
                                            />
                                        </div>
                                        {aiSuggestion.possibleCauses?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">Possible causes</p>
                                                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                                                    {aiSuggestion.possibleCauses.map((c, i) => <li key={i}>{c}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {aiSuggestion.initialChecks?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">Safe initial checks</p>
                                                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                                                    {aiSuggestion.initialChecks.map((c, i) => <li key={i}>{c}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {aiSuggestion.recurringWarning && (
                                            <p className="rounded-md bg-amber-100 px-2.5 py-1.5 text-xs text-amber-800">
                                                ⚠ {aiSuggestion.recurringWarning}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!user && (
                                    <div className="space-y-3 border-t border-border pt-3">
                                        <p className="text-xs font-medium text-muted-foreground">Your contact info</p>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="guestName">Full name</Label>
                                            <Input id="guestName" required value={guest.guestName} onChange={(e) => setGuest({ ...guest, guestName: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="guestEmail">Email</Label>
                                            <Input id="guestEmail" type="email" required value={guest.guestEmail} onChange={(e) => setGuest({ ...guest, guestEmail: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="guestPhone">Phone (optional)</Label>
                                            <Input id="guestPhone" value={guest.guestPhone} onChange={(e) => setGuest({ ...guest, guestPhone: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit issue report'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-xs text-muted-foreground">
                    Already reported something? <Link to="/track-issue" className="text-primary hover:underline">Track your issue</Link>
                </p>
            </div>
        </div>
    )
}