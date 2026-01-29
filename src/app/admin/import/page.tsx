'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, FileText, Database } from 'lucide-react'
import { batchCreatePosts } from '@/app/actions/import/batch-create'
import { batchCreateProfiles } from '@/app/actions/import/batch-create-profiles'

export default function BatchImportPage() {
    const [jsonInput, setJsonInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)
    const [importType, setImportType] = useState<'posts' | 'billionaires' | 'companies' | 'startups' | 'pr'>('posts')

    const handleImport = async () => {
        if (!jsonInput.trim()) return

        setIsLoading(true)
        setResult(null)

        try {
            // 1. Parse JSON
            let parsedData
            try {
                parsedData = JSON.parse(jsonInput)
            } catch (e) {
                setResult({ success: false, message: 'Invalid JSON format. Please check your input.' })
                setIsLoading(false)
                return
            }

            // Auto-fix: If user pasted a single object, wrap it in an array
            if (!Array.isArray(parsedData) && typeof parsedData === 'object' && parsedData !== null) {
                parsedData = [parsedData]
            }

            if (!Array.isArray(parsedData)) {
                setResult({ success: false, message: 'Input must be a JSON Array [...] or a single valid JSON object' })
                setIsLoading(false)
                return
            }

            // 2. Send to Server Action
            let response
            if (importType === 'posts') {
                response = await batchCreatePosts(parsedData)
            } else {
                // Map UI selection to table names
                const tableMap: any = {
                    'billionaires': 'billionaires',
                    'companies': 'companies',
                    'startups': 'startup_stories',
                    'pr': 'pr_segments'
                }
                response = await batchCreateProfiles(parsedData, tableMap[importType])
            }


            if (response.success) {
                setResult({ success: true, message: `Successfully imported ${(response as any).count} items!` })
                setJsonInput('') // Clear input on success
            } else {
                setResult({ success: false, message: `Import failed: ${(response as any).errors || (response as any).error}` })
            }

        } catch (error: any) {
            console.error('Import error:', error)
            setResult({ success: false, message: error.message || 'Unknown error occurred' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-heading font-bold">Batch Content Importer</h1>
                <p className="text-muted-foreground mt-2">
                    Paste the JSON output from Gemini to bulk import Drafts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>JSON Input</CardTitle>
                        <CardDescription>
                            Paste the list `[...]` from the Gemini prompt here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[ { "title": "Example", ... } ]'
                            className="min-h-[400px] font-mono text-xs"
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleImport} disabled={!jsonInput || isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    'Process Batch'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Type</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button
                                variant={importType === 'posts' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => setImportType('posts')}
                            >
                                <FileText className="mr-2 h-4 w-4" /> News Articles
                            </Button>
                            <div className="my-2 border-t" />
                            <Label className="text-xs text-muted-foreground mb-2 block">Database Tables</Label>
                            <Button
                                variant={importType === 'billionaires' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => setImportType('billionaires')}
                            >
                                <Database className="mr-2 h-4 w-4" /> Billionaires
                            </Button>
                            <Button
                                variant={importType === 'companies' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => setImportType('companies')}
                            >
                                <Database className="mr-2 h-4 w-4" /> Companies
                            </Button>
                            <Button
                                variant={importType === 'startups' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => setImportType('startups')}
                            >
                                <Database className="mr-2 h-4 w-4" /> Startup Stories
                            </Button>
                            <Button
                                variant={importType === 'pr' ? 'default' : 'outline'}
                                className="justify-start"
                                onClick={() => setImportType('pr')}
                            >
                                <Database className="mr-2 h-4 w-4" /> PR Segments
                            </Button>
                        </CardContent>
                    </Card>

                    {result && (
                        <Alert variant={result.success ? 'default' : 'destructive'} className={result.success ? 'border-green-500 text-green-600' : ''}>
                            {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <AlertTitle>{result.success ? 'Success' : 'Error'}</AlertTitle>
                            <AlertDescription>
                                {result.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    )
}

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
    return <span className={className}>{children}</span>
}
