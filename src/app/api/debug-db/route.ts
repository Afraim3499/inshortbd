import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('billionaires')
        .select('slug, name, biography')
        .eq('slug', 'elon-musk')
        .single()

    return NextResponse.json({ data, error })
}
