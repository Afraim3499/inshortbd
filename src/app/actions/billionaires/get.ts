'use server'

import { createClient } from '@/utils/supabase/server'
import type { BillionaireWithHoldings, BillionaireFilters } from '@/types/finance.types'

/**
 * Fetches a single billionaire by slug with all holdings and company data
 */
export async function getBillionaireBySlug(
    slug: string
): Promise<BillionaireWithHoldings | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await (supabase
            .from('billionaires') as any)
            .select(
                `
        *,
        holdings:billionaire_holdings(
          *,
          company:companies(*)
        )
      `
            )
            .eq('slug', slug)
            .eq('is_active', true)
            .single()

        if (error || !data) {
            console.error('Error fetching billionaire:', error)
            return null
        }

        return data as BillionaireWithHoldings
    } catch (error) {
        console.error('Error in getBillionaireBySlug:', error)
        return null
    }
}

/**
 * Fetches billionaires list with filtering, sorting, and pagination
 */
export async function getBillionaires(
    filters?: BillionaireFilters
): Promise<{ billionaires: BillionaireWithHoldings[]; total: number }> {
    try {
        const supabase = await createClient()

        let query = (supabase
            .from('billionaires') as any)
            .select(
                `
        *,
        holdings:billionaire_holdings(
          *,
          company:companies(*)
        )
      `,
                { count: 'exact' }
            )
            .eq('is_active', true)

        // Apply filters
        if (filters?.country) {
            query = query.eq('country_code', filters.country)
        }
        if (filters?.industry) {
            query = query.eq('industry', filters.industry)
        }
        if (filters?.ageGroup) {
            query = query.eq('age_group', filters.ageGroup)
        }
        if (filters?.gender) {
            query = query.eq('gender', filters.gender)
        }
        if (filters?.selfMadeOnly) {
            query = query.eq('is_self_made', true)
        }
        if (filters?.minNetWorth !== undefined) {
            query = query.gte('net_worth_usd', filters.minNetWorth)
        }
        if (filters?.maxNetWorth !== undefined) {
            query = query.lte('net_worth_usd', filters.maxNetWorth)
        }

        // Sorting
        const sortBy = filters?.sortBy || 'net_worth'
        if (sortBy === 'net_worth') {
            query = query.order('net_worth_usd', { ascending: false })
        } else if (sortBy === 'age') {
            query = query.order('age', { ascending: true, nullsFirst: false })
        } else if (sortBy === 'rank') {
            query = query.order('world_rank', { ascending: true, nullsFirst: false })
        } else {
            query = query.order('name', { ascending: true })
        }

        // Pagination
        const limit = filters?.limit || 50
        const offset = filters?.offset || 0
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching billionaires:', error)
            return { billionaires: [], total: 0 }
        }

        return {
            billionaires: (data || []) as BillionaireWithHoldings[],
            total: count || 0,
        }
    } catch (error) {
        console.error('Error in getBillionaires:', error)
        return { billionaires: [], total: 0 }
    }
}

/**
 * Gets list of unique countries with billionaire count
 */
export async function getBillionaireCountries(): Promise<
    Array<{ code: string; name: string; count: number }>
> {
    try {
        const supabase = await createClient()

        const { data, error } = await (supabase
            .from('billionaires') as any)
            .select('country_code')
            .eq('is_active', true)

        if (error || !data) return []

        const countryCounts: Record<string, number> = {}
        data.forEach((b: any) => {
            if (b.country_code) {
                countryCounts[b.country_code] = (countryCounts[b.country_code] || 0) + 1
            }
        })

        // You can map country codes to full names here
        const countryNames: Record<string, string> = {
            US: 'United States',
            CN: 'China',
            IN: 'India',
            GB: 'United Kingdom',
            FR: 'France',
            DE: 'Germany',
            // Add more as needed
        }

        return Object.entries(countryCounts).map(([code, count]) => ({
            code,
            name: countryNames[code] || code,
            count,
        }))
    } catch (error) {
        console.error('Error getting countries:', error)
        return []
    }
}

/**
 * Gets list of unique industries with billionaire count
 */
export async function getBillionaireIndustries(): Promise<
    Array<{ industry: string; count: number }>
> {
    try {
        const supabase = await createClient()

        const { data, error } = await (supabase
            .from('billionaires') as any)
            .select('industry')
            .eq('is_active', true)

        if (error || !data) return []

        const industryCounts: Record<string, number> = {}
        data.forEach((b: any) => {
            if (b.industry) {
                industryCounts[b.industry] = (industryCounts[b.industry] || 0) + 1
            }
        })

        return Object.entries(industryCounts)
            .map(([industry, count]) => ({ industry, count }))
            .sort((a, b) => b.count - a.count)
    } catch (error) {
        console.error('Error getting industries:', error)
        return []
    }
}

/**
 * Increments view count for a billionaire
 */
export async function incrementBillionaireViews(
    id: string
): Promise<{ success: boolean }> {
    try {
        const supabase = await createClient()

        const { error } = await (supabase
            .from('billionaires') as any)
            .update({ views: (supabase as any).raw('views + 1') })
            .eq('id', id)

        return { success: !error }
    } catch (error) {
        console.error('Error incrementing views:', error)
        return { success: false }
    }
}
/**
 * Gets aggregate stats for the hero section
 */
export async function getBillionaireStats(): Promise<{
    totalCount: number
    totalWealth: number
    countryCount: number
    averageDetails: number
}> {
    try {
        const supabase = await createClient()

        // Fetch minimal data needed for stats
        const { data, error } = await supabase
            .from('billionaires')
            .select('net_worth_usd, country_code')
            .eq('is_active', true)

        if (error || !data) {
            console.error('Error fetching stats:', error)
            return { totalCount: 0, totalWealth: 0, countryCount: 0, averageDetails: 0 }
        }

        const totalCount = data.length
        const totalWealth = data.reduce((acc: number, curr: { net_worth_usd: number | null }) => acc + (curr.net_worth_usd || 0), 0)

        const uniqueCountries = new Set(data.map((b: { country_code: string | null }) => b.country_code).filter(Boolean)).size

        return {
            totalCount,
            totalWealth,
            countryCount: uniqueCountries,
            averageDetails: totalCount > 0 ? totalWealth / totalCount : 0
        }
    } catch (error) {
        console.error('Error in getBillionaireStats:', error)
        return { totalCount: 0, totalWealth: 0, countryCount: 0, averageDetails: 0 }
    }
}
