import { ParsedProfileText, ParsedStartupText } from "@/types/finance-import.types"

/**
 * Parses the custom text-based import format.
 * Format:
 * [[PROFILE]]
 * Key: Value
 * ...
 * [[END]]
 */
// Helper to extract key-value from "Key: Value" or "Key \n Value"
// List of known keys to scan for. Order matters (longer matches first to avoid partials).
const KNOWN_KEYS = [
    'Add Event', // Special marker
    'Wealth Timeline', 'Financials', 'Demographics', 'Identity', // Section headers (ignore or context)
    'Full Name', 'Name', 'Slug', 'World Rank', 'Rank',
    'Net Worth (USD)', 'Net Worth', 'Change', 'Source of Wealth', 'Source',
    'Country Code', 'Country', 'Industry', 'Age', 'Gender',
    'Smart Import', 'Biography', 'Bio', 'Description', 'Label / Milestone', 'Label', 'Year'
].sort((a, b) => b.length - a.length)

export function parseBillionaireImportText(text: string): ParsedProfileText[] {
    const profiles: ParsedProfileText[] = []

    // Normalize newlines and easy cleanup
    // We don't split by [[PROFILE]] strictly anymore if not present, but let's try to support it if used.
    // If no [[PROFILE]] tag found, treat whole text as one profile.
    let blocks = text.split('[[PROFILE]]')
    if (blocks.length === 1 && !text.includes('[[PROFILE]]')) {
        blocks = ['', text] // Treat all as one block (index 1)
    }

    // Slice(1) because split result 0 is before first separator
    const profileBlocks = blocks.slice(1)

    for (const rawBlock of profileBlocks) {
        const block = rawBlock.split('[[END]]')[0]
        if (!block.trim()) continue

        const profile: Partial<ParsedProfileText> = {}

        // Strategy: Find all occurrences of "Key:" or specific markers
        // We build a list of tokens: { key: string, value: string }

        // 1. Identify positions of all keys
        // Regex: /((?:Key1|Key2|...)):?/gi  -- optional colon for section headers like "Wealth Timeline"
        const pattern = new RegExp(`(${KNOWN_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?::|\\s|$)`, 'gi')

        const matches = [...block.matchAll(pattern)]

        if (matches.length === 0) continue

        // 2. Extract values between matches
        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i]
            const nextMatch = matches[i + 1]

            const key = currentMatch[1].toLowerCase() // The captured key text
            const startIndex = currentMatch.index! + currentMatch[0].length
            const endIndex = nextMatch ? nextMatch.index! : block.length

            const value = block.substring(startIndex, endIndex).trim()

            // Clean up value (remove trailing/leading punctuation if needed, but mostly trim is enough)

            // Map to profile fields
            switch (key) {
                case 'full name':
                case 'name':
                    profile.name = value
                    break
                case 'slug':
                    profile.slug = value
                    break
                case 'rank':
                case 'world rank':
                    const parsedRank = parseInt(value.replace(/[^0-9]/g, ''), 10)
                    profile.rank = isNaN(parsedRank) ? 0 : parsedRank
                    break
                case 'net worth':
                case 'net worth (usd)':
                    profile.net_worth_raw = value
                    break
                case 'change':
                    profile.change_raw = value
                    break
                case 'age':
                    const parsedAge = parseInt(value, 10)
                    profile.age = isNaN(parsedAge) ? 0 : parsedAge
                    break
                case 'gender':
                    profile.gender = value as any // 'Male' | 'Female'
                    break
                case 'country':
                case 'country code':
                    profile.country_code = value
                    break
                case 'industry':
                    profile.industry = value
                    break
                case 'source':
                case 'source of wealth':
                    profile.source_of_wealth = value.split(/[,\n]/).map(s => s.trim()).filter(s => s)
                    break
                case 'bio':
                case 'biography':
                case 'smart import':
                    profile.biography = value
                    break

                // Timeline
                case 'add event':
                    // Trigger a new event object
                    if (!profile.wealth_timeline) profile.wealth_timeline = []
                    profile.wealth_timeline.push({} as any)
                    break

                case 'year':
                    ensureTimelineEvent(profile)
                    const parsedYear = parseInt(value, 10)
                    getLastEvent(profile).year = isNaN(parsedYear) ? new Date().getFullYear() : parsedYear
                    break
                case 'label':
                case 'label / milestone':
                    ensureTimelineEvent(profile)
                    getLastEvent(profile).label = value
                    break
                case 'description':
                    ensureTimelineEvent(profile)
                    getLastEvent(profile).description = value
                    break
            }
        }

        if (profile.name || profile.net_worth_raw) {
            profiles.push(profile as ParsedProfileText)
        }
    }

    return profiles
}

function ensureTimelineEvent(profile: Partial<ParsedProfileText>) {
    if (!profile.wealth_timeline) profile.wealth_timeline = []
    if (profile.wealth_timeline.length === 0) profile.wealth_timeline.push({} as any)
}

function getLastEvent(profile: Partial<ParsedProfileText>) {
    return profile.wealth_timeline![profile.wealth_timeline!.length - 1]
}

/**
 * Helper to parse currency strings like "$240.5B" to numbers
 */
/**
 * Helper to parse currency strings.
 * Handles: "$240.5B", "~$62.5 Billion", "$12 Billion+", "240M"
 */
export function parseCurrencyString(value: string): number {
    const v = value.toUpperCase()
    let multiplier = 1

    if (v.includes('BILLION') || v.includes(' B') || v.endsWith('B')) multiplier = 1_000_000_000
    else if (v.includes('MILLION') || v.includes(' M') || v.endsWith('M')) multiplier = 1_000_000
    else if (v.includes('TRILLION') || v.includes(' T') || v.endsWith('T')) multiplier = 1_000_000_000_000

    // Remove non-numeric characters except dot
    const cleanNum = value.replace(/[^0-9.]/g, '')
    const num = parseFloat(cleanNum)

    return isNaN(num) ? 0 : Math.round(num * multiplier)
}

// ------------------------------------------------------------------
// STARTUP STORIES PARSER
// ------------------------------------------------------------------

const STARTUP_KNOWN_KEYS = [
    'Company Data', 'Financials', 'Classification', 'The Struggle / Origin', 'The Struggle', 'The Origin', 'The Breakthrough', 'The Wisdom', // Section headers
    'Company Name', 'Company',
    'Slug',
    'Founder', 'Founders',
    'Founded Year', 'Founded',
    'Region', 'Location',
    'Industry', 'Sector',
    'Story Type', 'Type',
    'Valuation (USD)', 'Valuation',
    'Total Raised (USD)', 'Raised', 'Total Raised',
    'Hero Image', 'Image',
    // 'Narrative Content' removed so it doesn't split the block. We clean it from the value instead.
].sort((a, b) => b.length - a.length)

export function parseStartupImportText(text: string): ParsedStartupText[] {
    const startups: ParsedStartupText[] = []

    // Similar robust block splitting
    let blocks = text.split('[[STARTUP]]')
    if (blocks.length === 1 && !text.includes('[[STARTUP]]')) {
        blocks = ['', text]
    }
    const startupBlocks = blocks.slice(1)

    for (const rawBlock of startupBlocks) {
        const block = rawBlock.split('[[END]]')[0]
        if (!block.trim()) continue

        const startup: Partial<ParsedStartupText> = {}

        // Regex for keys
        const pattern = new RegExp(`(${STARTUP_KNOWN_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?:\\s*\\(Prompt:.*?\\))?(?::|\\s|$)`, 'gi')
        const matches = [...block.matchAll(pattern)]

        if (matches.length === 0) continue

        for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i]
            const nextMatch = matches[i + 1]

            const key = currentMatch[1].toLowerCase()
            const startIndex = currentMatch.index! + currentMatch[0].length
            const endIndex = nextMatch ? nextMatch.index! : block.length

            const value = block.substring(startIndex, endIndex).trim()

            // Map fields
            switch (key) {
                case 'company name':
                case 'company':
                    startup.company_name = value
                    break
                case 'slug':
                    startup.slug = value
                    break
                case 'founder':
                case 'founders':
                    startup.founder_name = value
                    break
                case 'founded year':
                case 'founded':
                    const yr = parseInt(value, 10)
                    startup.founded_year = isNaN(yr) ? undefined : yr
                    break
                case 'region':
                case 'location':
                    startup.region = value
                    break
                case 'industry':
                case 'sector':
                    startup.industry = value
                    break
                case 'story type':
                case 'type':
                    // normalize
                    const v = value.toLowerCase()
                    if (v.includes('failure') || v.includes('lesson')) startup.story_type = 'failure'
                    else startup.story_type = 'success' // Default to success (includes 'unicorn', 'success', etc)
                    break
                case 'valuation (usd)':
                case 'valuation':
                    startup.current_valuation_usd_raw = value
                    break
                case 'total raised (usd)':
                case 'total raised':
                case 'raised':
                    startup.funding_raised_usd_raw = value
                    break
                case 'the struggle / origin':
                case 'the struggle':
                case 'the origin':
                    startup.struggle_section = value
                    break
                case 'the breakthrough':
                    startup.breakthrough_section = value
                    break
                case 'the wisdom':
                    startup.wisdom_section = value
                    break
                case 'hero image':
                case 'image':
                    startup.hero_image_url = value
                    break
                // Handle "Narrative Content" which usually follows headers like "The Wisdom"
                // But in our flexible parser, the key *is* the header. 
                // However, user might paste: "The Wisdom \n Narrative Content (Prompt...): Actual content"
                // Our regex allows optional (Prompt...) matching in the key itself to cover that.
            }
        }

        // Special handling if "Narrative Content" is a key inside a section?
        // Actually, since we parse sequentially, if the user pastes:
        // "The Wisdom Narrative Content: bla bla"
        // "The Wisdom" matches. Value is "Narrative Content: bla bla".
        // It's fine. We might want to clean up "Narrative Content" from the start of the value if present.
        if (startup.struggle_section?.startsWith('Narrative Content')) startup.struggle_section = startup.struggle_section.replace(/^Narrative Content.*?:?\s*/i, '')
        if (startup.breakthrough_section?.startsWith('Narrative Content')) startup.breakthrough_section = startup.breakthrough_section.replace(/^Narrative Content.*?:?\s*/i, '')
        if (startup.wisdom_section?.startsWith('Narrative Content')) startup.wisdom_section = startup.wisdom_section.replace(/^Narrative Content.*?:?\s*/i, '')


        if (startup.company_name) {
            startups.push(startup as ParsedStartupText)
        }
    }

    return startups
}
