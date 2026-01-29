'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface BatchImportProfile {
    name: string
    net_worth?: string
    source?: string
    country?: string
    industry?: string
    biography?: string
}

interface BatchImportCompany {
    name: string
    symbol?: string
    market_cap?: string
    ceo?: string
    headquarters?: string
    description?: string
}

interface BatchImportStartup {
    company_name: string
    founder_name?: string
    industry?: string
    valuation?: string
    story_narrative?: string
}

interface BatchImportPR {
    client_name: string
    title: string
    content: string
    status?: string
}

export async function batchCreateProfiles(profiles: BatchImportProfile[], type: 'billionaires' | 'companies' | 'startup_stories' | 'pr_segments') {
    const supabase = await createClient()

    // Map fields based on table type
    let dataToInsert: any[] = []

    if (type === 'billionaires') {
        dataToInsert = profiles.map(p => ({
            name: p.name,
            net_worth: p.net_worth,
            source: p.source,
            country: p.country,
            industry: p.industry,
            bio: p.biography // Map 'biography' to 'bio' if that is the column name. I'll check schema.
        }))
    } else if (type === 'companies') {
        dataToInsert = profiles.map((p: any) => ({
            name: p.name,
            symbol: p.symbol,
            market_cap: p.market_cap,
            ceo: p.ceo,
            headquarters: p.headquarters,
            description: p.description
        }))
    } else if (type === 'startup_stories') {
        dataToInsert = profiles.map((p: any) => ({
            company_name: p.company_name,
            founder_name: p.founder_name,
            industry: p.industry,
            valuation: p.valuation,
            story: p.story_narrative // Map narrative to 'story' column? Need to verify.
        }))
    } else if (type === 'pr_segments') {
        dataToInsert = profiles.map((p: any) => ({
            client_name: p.client_name,
            title: p.title,
            content: p.content,
            status: p.status || 'draft'
        }))
    }

    const { error } = await supabase.from(type).insert(dataToInsert)

    if (error) {
        console.error(`Error inserting into ${type}:`, error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/admin/${type}`) // Assuming routes exist
    return { success: true, count: dataToInsert.length }
}
