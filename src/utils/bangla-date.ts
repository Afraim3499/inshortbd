/**
 * Bangla Date Formatter
 * Formats dates in Bengali locale (bn-BD)
 */

export function formatBanglaDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString

    return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

export function formatBanglaDateTime(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString

    return date.toLocaleString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}
