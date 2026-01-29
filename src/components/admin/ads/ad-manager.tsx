'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, ExternalLink, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react'
import { NewsImage } from '@/components/news-image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Ad {
    id: string
    title: string
    image_url: string
    target_url: string
    placement: string
    active: boolean
    created_at: string
}

const PLACEMENTS = [
    { value: 'homepage_sidebar', label: 'Homepage Sidebar' },
    { value: 'article_sidebar', label: 'Article Sidebar' },
    { value: 'article_inline', label: 'Article Inline' },
    { value: 'finance_banner', label: 'Finance Page Banner' },
]

export function AdManager() {
    const supabase = createClient()
    const { toast } = useToast()
    const [ads, setAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [saving, setSaving] = useState(false)

    // Form State
    const [formData, setFormData] = useState<Partial<Ad>>({
        title: '',
        image_url: '',
        target_url: '',
        placement: 'homepage_sidebar',
        active: true
    })

    const fetchAds = async () => {
        try {
            const { data, error } = await supabase
                .from('ads')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setAds(data || [])
        } catch (error) {
            console.error('Error fetching ads:', error)
            toast({
                title: 'Error',
                description: 'Failed to load ads',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAds()
    }, [])

    const handleCreate = async () => {
        if (!formData.title || !formData.image_url || !formData.target_url) {
            toast({
                title: 'Validation Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            })
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase
                .from('ads')
                .insert([formData])

            if (error) throw error

            toast({
                title: 'Success',
                description: 'Ad created successfully',
            })
            setIsCreating(false)
            setFormData({
                title: '',
                image_url: '',
                target_url: '',
                placement: 'homepage_sidebar',
                active: true
            })
            fetchAds()
        } catch (error) {
            console.error('Error creating ad:', error)
            toast({
                title: 'Error',
                description: 'Failed to create ad',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return

        try {
            const { error } = await supabase
                .from('ads')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast({
                title: 'Deleted',
                description: 'Ad deleted successfully',
            })
            setAds(prev => prev.filter(ad => ad.id !== id))
        } catch (error) {
            console.error('Error deleting ad:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete ad',
                variant: 'destructive',
            })
        }
    }

    const toggleActive = async (id: string, currentState: boolean) => {
        try {
            const { error } = await supabase
                .from('ads')
                .update({ active: !currentState })
                .eq('id', id)

            if (error) throw error

            setAds(prev => prev.map(ad =>
                ad.id === id ? { ...ad, active: !currentState } : ad
            ))
            toast({
                title: currentState ? 'Paused' : 'Active',
                description: currentState ? 'Ad paused' : 'Ad activated',
            })
        } catch (error) {
            console.error('Error updating ad:', error)
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive',
            })
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading font-bold">Ad Management</h2>
                    <p className="text-muted-foreground">Manage advertisement placements across the site.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? "secondary" : "default"}>
                    {isCreating ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isCreating ? 'Cancel' : 'New Ad'}
                </Button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">Create New Ad</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Ad Title (Internal Reference)</Label>
                                <Input
                                    placeholder="e.g. Summer Promo"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Placement</Label>
                                <Select
                                    value={formData.placement}
                                    onValueChange={val => setFormData(prev => ({ ...prev, placement: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLACEMENTS.map(p => (
                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Target URL (Where user creates goes on click)</Label>
                                <Input
                                    placeholder="https://"
                                    value={formData.target_url}
                                    onChange={e => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://..."
                                        value={formData.image_url}
                                        onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Recommended size: 300x250px</p>
                            </div>

                            {/* Preview */}
                            <div className="aspect-[300/250] bg-muted/50 rounded-lg overflow-hidden border border-border relative flex items-center justify-center">
                                {formData.image_url ? (
                                    <NewsImage
                                        src={formData.image_url}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <ImageIcon className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                        <span className="text-xs">Image Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Ad
                        </Button>
                    </div>
                </div>
            )}

            {/* Ad List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group">
                        <div className="relative aspect-[300/250] bg-muted">
                            <NewsImage
                                src={ad.image_url}
                                alt={ad.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {ad.active ? 'Active' : 'Paused'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-bold text-ink-black truncate">{ad.title}</h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{PLACEMENTS.find(p => p.value === ad.placement)?.label || ad.placement}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 truncate">
                                <ExternalLink className="w-3 h-3" />
                                <a href={ad.target_url} target="_blank" rel="noreferrer" className="hover:underline truncate">{ad.target_url}</a>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={ad.active}
                                        onCheckedChange={() => toggleActive(ad.id, ad.active)}
                                    />
                                    <span className="text-sm text-muted-foreground">{ad.active ? 'On' : 'Off'}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(ad.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {ads.length === 0 && !isCreating && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                        <p>No ads found.</p>
                        <Button variant="link" onClick={() => setIsCreating(true)}>Create your first ad</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
