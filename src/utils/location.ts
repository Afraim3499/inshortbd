
const CITY_MAP: Record<string, string> = {
    'chittagong': 'Chittagong, Bangladesh', 'চট্টগ্রাম': 'Chittagong, Bangladesh',
    'sylhet': 'Sylhet, Bangladesh', 'সিলেট': 'Sylhet, Bangladesh',
    'khulna': 'Khulna, Bangladesh', 'খুলনা': 'Khulna, Bangladesh',
    'rajshahi': 'Rajshahi, Bangladesh', 'রাজশাহী': 'Rajshahi, Bangladesh',
    'barisal': 'Barisal, Bangladesh', 'বরিশাল': 'Barisal, Bangladesh',
    'rangpur': 'Rangpur, Bangladesh', 'রংপুর': 'Rangpur, Bangladesh',
    'mymensingh': 'Mymensingh, Bangladesh', 'ময়মনসিংহ': 'Mymensingh, Bangladesh',
    'comilla': 'Comilla, Bangladesh', 'কুমিল্লা': 'Comilla, Bangladesh',
    'cox\'s bazar': 'Cox\'s Bazar, Bangladesh', 'কক্সবাজার': 'Cox\'s Bazar, Bangladesh'
};

export function detectLocationFromTags(tags: string[] | null | undefined): string {
    if (!tags || tags.length === 0) {
        return 'Dhaka, Bangladesh';
    }

    for (const tag of tags) {
        const lowerTag = tag.trim().toLowerCase();
        if (CITY_MAP[lowerTag]) {
            return CITY_MAP[lowerTag];
        }
    }

    return 'Dhaka, Bangladesh';
}
