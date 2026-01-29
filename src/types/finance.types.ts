import { Database } from './database.types'

// =====================================================
// Finance Section Types
// =====================================================

// Base table types
export type Billionaire = Database['public']['Tables']['billionaires']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type BillionaireHolding = Database['public']['Tables']['billionaire_holdings']['Row']
export type StartupStory = Database['public']['Tables']['startup_stories']['Row']
export type PRSegment = Database['public']['Tables']['pr_segments']['Row']

// Insert types
export type BillionaireInsert = Database['public']['Tables']['billionaires']['Insert']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type HoldingInsert = Database['public']['Tables']['billionaire_holdings']['Insert']
export type StartupStoryInsert = Database['public']['Tables']['startup_stories']['Insert']
export type PRSegmentInsert = Database['public']['Tables']['pr_segments']['Insert']

// Update types
export type BillionaireUpdate = Database['public']['Tables']['billionaires']['Update']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']
export type HoldingUpdate = Database['public']['Tables']['billionaire_holdings']['Update']
export type StartupStoryUpdate = Database['public']['Tables']['startup_stories']['Update']
export type PRSegmentUpdate = Database['public']['Tables']['pr_segments']['Update']

// =====================================================
// Extended Types (with relationships)
// =====================================================

export interface HoldingWithCompany extends BillionaireHolding {
    company: Company
}

export interface BillionaireWithHoldings extends Billionaire {
    holdings: HoldingWithCompany[]
    wealth_history?: any
}

export interface PRSegmentWithBillionaire extends PRSegment {
    billionaire: BillionaireWithHoldings
}

export interface StartupStoryExtended extends StartupStory {
    title: string
    company_name: string
    hero_image_url: string
    content: any
    stats: {
        valuation: string
        capital_raised?: string
        value_lost?: string
        countries?: number
        users?: string
        years?: number
    }
    timeline: {
        date: string
        title: string
        description: string
    }[]
    lessons: {
        title: string
        content: string
    }[]
}

// =====================================================
// Filter Types
// =====================================================

export interface BillionaireFilters {
    country?: string
    industry?: string
    minNetWorth?: number
    maxNetWorth?: number
    ageGroup?: 'under-40' | '40-60' | '60+'
    gender?: 'male' | 'female' | 'other'
    selfMadeOnly?: boolean
    sortBy?: 'net_worth' | 'age' | 'name' | 'rank'
    limit?: number
    offset?: number
}

export interface StartupStoryFilters {
    type?: 'success' | 'failure'
    region?: string
    industry?: string
    publishedOnly?: boolean
    featuredOnly?: boolean
    limit?: number
    offset?: number
}

export interface PRSegmentFilters {
    segmentType?: string
    year?: number
    sponsoredOnly?: boolean
    limit?: number
    offset?: number
}

// =====================================================
// Display Types (formatted for UI)
// =====================================================

export interface BillionaireDisplay extends Billionaire {
    netWorthFormatted: string // e.g., "$91.2B"
    changeToday: string // e.g., "+$15.8B (+21%)"
    changeYTD: string // e.g., "+$45.1B"
    countryName: string // Full country name
    ageDisplay: string // e.g., "60 years old"
}

export interface CompanyDisplay extends Company {
    marketCapFormatted: string // e.g., "$2.2T"
    stockPriceFormatted: string // e.g., "$892.45"
}

// =====================================================
// Utility Types
// =====================================================

export type StorySection = {
    content: any // TipTap JSON
    isEmpty: boolean
}

export type NetworkWorthChange = {
    amount: number
    percentage: number
    direction: 'up' | 'down' | 'unchanged'
}

export type TimelineEvent = {
    year: number
    netWorth: number
    label: string
    description?: string
    color?: 'blue' | 'green' | 'gray' | 'red'
}

// =====================================================
// API Response Types
// =====================================================

export interface BillionairesListResponse {
    billionaires: BillionaireWithHoldings[]
    total: number
    page: number
    pageSize: number
}

export interface PRSegmentResponse {
    segment: string
    year: number
    billionaires: BillionaireWithHoldings[]
    stats: {
        totalCount: number
        combinedWealth: number
        averageAge: number
        selfMadePercentage: number
    }
}

export interface StartupStoriesResponse {
    stories: StartupStory[]
    total: number
    page: number
    pageSize: number
}
