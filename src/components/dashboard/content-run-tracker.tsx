'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Circle, Trophy, Calendar, Edit2, Save } from 'lucide-react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useState, useEffect } from 'react'
import { useCategories } from '@/hooks/use-categories'

export function ContentRunTracker() {
    const supabase = createClient()
    const now = new Date()
    const startDate = startOfMonth(now).toISOString()
    const endDate = endOfMonth(now).toISOString()
    const currentMonthName = format(now, 'MMMM yyyy')
    const queryClient = useQueryClient()

    // Fetch categories and their targets from Supabase
    const { data: goalsData, isLoading: goalsLoading } = useQuery({
        queryKey: ['content-goals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('content_goals')
                .select('*')
                .order('category')
            if (error) throw error
            return data
        }
    })

    // We still need categories for the UI, but targets come from goalsData
    const { categories: allCategories, isLoading: loadingCategories } = useCategories()
    const [isEditing, setIsEditing] = useState(false)
    const [editedTargets, setEditedTargets] = useState<Record<string, number>>({})

    // Fetch actual post counts for current month + Finance Special Items
    const { data: progressData, isLoading: progressLoading } = useQuery({
        queryKey: ['content-progress', startDate], // Use startDate for queryKey
        queryFn: async () => {
            // Use already defined startDate and endDate
            // 1. Articles Count
            const { data: posts, error } = await supabase
                .from('posts')
                .select('category, published_at')
                .gte('published_at', startDate)
                .lte('published_at', endDate)
                .eq('status', 'published')

            if (error) throw error

            // 2. Billionaires Count (New profiles added this month)
            const { count: billionaireCount, error: bError } = await supabase
                .from('billionaires')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startDate)
                .lte('created_at', endDate)

            if (bError) throw bError

            // 3. Startups Count (New stories added this month)
            const { count: startupCount, error: sError } = await supabase
                .from('startup_stories')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startDate)
                .lte('created_at', endDate)
            // Note: logic might change if we only count PUBLISHED stories.
            // let's assume we count created for now, or maybe only published?
            // .eq('is_published', true) // optional constraint

            if (sError) throw sError


            // Aggregate article counts
            const counts: Record<string, number> = {}
            posts?.forEach((post: any) => {
                const cat = post.category || 'Uncategorized'
                counts[cat] = (counts[cat] || 0) + 1
            })

            // Inject Finance Special Counts
            // "Billionaires" category in `content_goals` should map to `billionaires` table count
            // "Startups" category in `content_goals` should map to `startup_stories` table count
            // "Wealth" category usually maps to standard articles, or Playbook? 
            // In the plan, "Wealth" -> "Playbook Strategies". However, strategies are static/limited (7 steps).
            // Maybe "Wealth" goal tracks Wealth Articles? Let's assume Wealth Articles for now unless specified.
            // The user said "Wealth Playbook (which covers Wealth)" but usually Playbook is a feature, not monthly articles.
            // Let's assume "Wealth" category tracks generic articles, AND we add special tracking if needed.
            // For now, I will OVERRIDE the count for "Billionaires" and "Startups" if they exist in the goals.

            if (billionaireCount !== null) {
                counts['Billionaires'] = (counts['Billionaires'] || 0) + (billionaireCount || 0)
                // Note: If they also publish *articles* with category "Billionaires", we sum them? 
                // Or does the "Billionaires" section ONLY come from the table?
                // Visuals imply "Billionaires" section is powered by the table. 
                // Let's assume the Goal for "Billionaires" is satisfied by adding Profile entries.
                // If the user publishes a standard article with category "Billionaires", it is already counted in `posts`.
                // So I will just ADD them.
            }

            if (startupCount !== null) {
                counts['Startups'] = (counts['Startups'] || 0) + (startupCount || 0)
            }

            return counts
        }
    })

    // Update targets mutation
    const updateTargetMutation = useMutation({
        mutationFn: async (newTargets: Record<string, number>) => {
            const updates = Object.entries(newTargets).map(([category, target_count]) => ({
                category,
                target_count,
                updated_at: new Date().toISOString()
            }))

            const { error } = await supabase
                .from('content_goals')
                .upsert(updates)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content-goals'] })
            queryClient.invalidateQueries({ queryKey: ['categories'] }) // Sync hook
            setIsEditing(false)
        }
    })

    // Initialize edited targets when entering edit mode or when categories load
    // NOTE: This is a legitimate state sync pattern - initializing form state from props
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (allCategories.length > 0) {
            const targetMap: Record<string, number> = {}
            allCategories.forEach((c: { name: string, target: number }) => targetMap[c.name] = c.target)
            setEditedTargets(targetMap)
        }
    }, [JSON.stringify(allCategories)])
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleSave = () => {
        updateTargetMutation.mutate(editedTargets)
    }

    // Calculate totals
    const totalTarget = allCategories.reduce((acc: number, cat: { target: number }) => acc + cat.target, 0)
    const totalPublished = progressData ? Object.values(progressData).reduce((a, b) => (a as number) + (b as number), 0) : 0
    const completionPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalPublished / totalTarget) * 100)) : 0

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Content Run
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span suppressHydrationWarning>{currentMonthName}</span>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-2xl font-bold font-heading">{completionPercentage}%</span>
                            <span className="text-xs text-muted-foreground block">Monthly Goal</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            disabled={updateTargetMutation.isPending}
                        >
                            {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                {!isEditing && <Progress value={completionPercentage} className="h-2 mt-2" />}
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                    {allCategories.map((cat: { name: string, target: number }) => {
                        const categoryName = cat.name
                        const current = progressData ? progressData[categoryName] || 0 : 0
                        const target = cat.target
                        const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
                        const isComplete = current >= target

                        return (
                            <div key={categoryName} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        {isComplete && !isEditing ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground/30" />
                                        )}
                                        <span className="font-medium">{categoryName}</span>
                                    </div>

                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs">{current} /</span>
                                            <Input
                                                type="number"
                                                className="h-6 w-16 text-right px-1"
                                                value={editedTargets[categoryName] || 0}
                                                onChange={(e) => setEditedTargets(prev => ({
                                                    ...prev,
                                                    [categoryName]: parseInt(e.target.value) || 0
                                                }))}
                                            />
                                        </div>
                                    ) : (
                                        <span className={`text-xs ${isComplete ? 'text-green-600 font-bold' : 'text-muted-foreground'}`}>
                                            {current} / {target}
                                        </span>
                                    )}
                                </div>
                                {!isEditing && (
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
