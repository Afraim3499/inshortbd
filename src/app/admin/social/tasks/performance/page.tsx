'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useSocialTaskKPI } from '@/hooks/useSocialTasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Users, CheckCircle2, Clock, BarChart3 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function PerformancePage() {
  const supabase = createClient()
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  // Fetch all users for dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('id, email, full_name, role')
        .in('role', ['admin', 'editor'])
        .order('full_name', { ascending: true })

      if (error) throw error
      return (data || []) as Array<{
        id: string
        email: string
        full_name: string | null
        role: string
      }>
    },
  })

  // Fetch KPI data
  const { data: kpiData, isLoading } = useSocialTaskKPI(selectedUserId)

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
        <h1 className="text-3xl font-heading font-bold">Employee Performance</h1>
        <div className="flex gap-2">
          <Select value={selectedUserId || 'all'} onValueChange={(v) => setSelectedUserId(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v: 'week' | 'month' | 'all') => setTimeRange(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.totalTasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All assigned tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpiData?.pendingTasks || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpiData?.avgCompletionTime
                ? `${kpiData.avgCompletionTime}h`
                : kpiData?.avgCompletionTime === 0
                  ? '0h'
                  : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hours per task</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      {kpiData && Object.keys(kpiData.platformBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Total Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(kpiData.platformBreakdown).map(([platform, data]) => {
                    const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                    return (
                      <TableRow key={platform}>
                        <TableCell className="font-medium capitalize">{platform}</TableCell>
                        <TableCell>{data.total}</TableCell>
                        <TableCell>{data.completed}</TableCell>
                        <TableCell>
                          <Badge variant={rate >= 80 ? 'default' : rate >= 50 ? 'secondary' : 'outline'}>
                            {rate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




