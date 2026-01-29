'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SubscribersPage() {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers', searchQuery],
    queryFn: async () => {
      let query = (supabase
        .from('newsletter_subscribers') as any)
        .select('id, email, name, status, subscribed_at, source')
        .order('subscribed_at', { ascending: false })

      if (searchQuery.trim()) {
        query = query.or(`email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as Array<{
        id: string
        email: string
        name: string | null
        status: string
        subscribed_at: string
        source: string | null
      }>
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Subscribers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {subscribers && subscribers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Subscribed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            subscriber.status === 'active'
                              ? 'default'
                              : subscriber.status === 'unsubscribed'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {subscriber.source || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No subscribers found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





