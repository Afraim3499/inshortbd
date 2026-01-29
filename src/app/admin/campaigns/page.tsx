'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UTMManager } from '@/components/tracking/utm-manager'
import { Plus } from 'lucide-react'

export default function CampaignsPage() {
  const [utmDialogOpen, setUtmDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Campaigns</h1>
          <p className="text-zinc-400 mt-1">
            Generate UTM-tracked URLs and manage marketing campaigns
          </p>
        </div>
        <Dialog open={utmDialogOpen} onOpenChange={setUtmDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate UTM URL
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800 text-zinc-50 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>UTM URL Generator</DialogTitle>
            </DialogHeader>
            <UTMManager />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-semibold mb-4">About UTM Tracking</h2>
        <div className="space-y-4 text-zinc-300">
          <p>
            UTM parameters help you track the effectiveness of your marketing campaigns.
            Add UTM parameters to your URLs to see which campaigns drive the most traffic.
          </p>
          <div>
            <h3 className="font-semibold text-zinc-50 mb-2">Required Parameters:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Source:</strong> Where the traffic comes from (e.g., google, facebook)</li>
              <li><strong>Medium:</strong> Marketing medium (e.g., social, email, cpc)</li>
              <li><strong>Campaign:</strong> Campaign name or identifier</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-50 mb-2">Optional Parameters:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Term:</strong> Search keywords (for paid search)</li>
              <li><strong>Content:</strong> Ad variant identifier (for A/B testing)</li>
            </ul>
          </div>
          <p className="text-sm text-zinc-400">
            Generated URLs are automatically tracked in your Analytics dashboard. You can filter
            analytics data by campaign to measure ROI and performance.
          </p>
        </div>
      </div>
    </div>
  )
}






