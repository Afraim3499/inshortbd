export const CATEGORIES = ['Politics', 'Tech', 'Culture', 'Business', 'World', 'Finance', 'Sports', 'Entertainment'] as const

export const DEFAULT_CATEGORY_TARGETS: Record<typeof CATEGORIES[number], number> = {
    Politics: 15,
    Tech: 12,
    Culture: 10,
    Business: 10,
    World: 8,
    Finance: 10,
    Sports: 10,
    Entertainment: 8,
}
