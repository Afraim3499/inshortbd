export interface ParsedProfileText {
    name: string;
    slug?: string;
    rank: number;
    net_worth_raw: string;     // e.g. "$240.5B" or "491900000000"
    change_raw: string;        // e.g. "+$1.5B"
    age: number;
    gender?: 'Male' | 'Female' | 'Other';
    country_code: string;
    industry: string;
    source_of_wealth: string[];
    biography: string;

    // Wealth Timeline / Portfolio History
    wealth_timeline?: {
        year: number;
        label: string;
        description: string;
    }[];
}

export interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: string[];
}

export interface ParsedStartupText {
    company_name: string;
    slug?: string;
    founder_name: string;
    founded_year?: number;
    region?: string;
    industry?: string;
    story_type?: string;
    current_valuation_usd_raw?: string;
    funding_raised_usd_raw?: string;
    struggle_section?: string;
    breakthrough_section?: string;
    wisdom_section?: string;
    hero_image_url?: string;
}
