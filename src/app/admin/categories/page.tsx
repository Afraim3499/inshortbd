'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CategoriesPage() {
    const supabase = createClient()
    const queryClient = useQueryClient()
    const [newCategory, setNewCategory] = useState('')
    const [newTarget, setNewTarget] = useState(10)
    const [error, setError] = useState('')

    // Fetch categories
    const { data: categories = [], isLoading } = useQuery({
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

    // Add Category Mutation
    const addCategoryMutation = useMutation({
        mutationFn: async () => {
            if (!newCategory.trim()) throw new Error("Category name cannot be empty")

            const { error } = await supabase
                .from('content_goals')
                .insert([{
                    category: newCategory.trim(),
                    target_count: newTarget
                }])

            if (error) {
                if (error.code === '23505') throw new Error("Category already exists")
                throw error
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content-goals'] })
            queryClient.invalidateQueries({ queryKey: ['categories'] }) // Invalidate the hook query too
            setNewCategory('')
            setNewTarget(10)
            setError('')
        },
        onError: (err: any) => {
            setError(err.message)
        }
    })

    // Delete Category Mutation
    const deleteCategoryMutation = useMutation({
        mutationFn: async (category: string) => {
            // Optional: Check if posts exist properly? 
            // For now, simpler implementation.
            const { error } = await supabase
                .from('content_goals')
                .delete()
                .eq('category', category)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content-goals'] })
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })

    // Update Target Mutation
    const updateTargetMutation = useMutation({
        mutationFn: async ({ category, target }: { category: string, target: number }) => {
            const { error } = await supabase
                .from('content_goals')
                .update({ target_count: target })
                .eq('category', category)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['content-goals'] })
        }
    })

    const handleUpdate = (category: string, value: string) => {
        const val = parseInt(value)
        if (!isNaN(val)) {
            updateTargetMutation.mutate({ category, target: val })
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8">
            <div>
                <h1 className="text-3xl font-heading font-bold">Category Management</h1>
                <p className="text-muted-foreground mt-2">Manage your publication&apos;s categories and monthly targets.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Add New Category Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Add Category</CardTitle>
                        <CardDescription>Create a new section.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g. Startups"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Monthly Target</Label>
                            <Input
                                type="number"
                                value={newTarget}
                                onChange={(e) => setNewTarget(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => addCategoryMutation.mutate()}
                            disabled={addCategoryMutation.isPending || !newCategory}
                        >
                            {addCategoryMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add Category
                        </Button>
                    </CardContent>
                </Card>

                {/* Existing Categories Table */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Active Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category Name</TableHead>
                                        <TableHead className="w-[100px]">Target</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((cat: any) => (
                                        <TableRow key={cat.category}>
                                            <TableCell className="font-medium">{cat.category}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    defaultValue={cat.target_count}
                                                    className="h-8 w-16"
                                                    onBlur={(e) => handleUpdate(cat.category, e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm(`Delete category "${cat.category}"?`)) {
                                                            deleteCategoryMutation.mutate(cat.category)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {categories.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                No categories found. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
