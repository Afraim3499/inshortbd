interface VideoSchemaProps {
    name: string
    description: string
    thumbnailUrl: string
    uploadDate: string
    contentUrl: string
    embedUrl?: string
    duration?: string // ISO 8601 format (e.g., "PT1M54S")
}

export function VideoSchema(props: VideoSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: props.name,
        description: props.description,
        thumbnailUrl: props.thumbnailUrl,
        uploadDate: props.uploadDate,
        contentUrl: props.contentUrl,
        embedUrl: props.embedUrl,
        duration: props.duration
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
