'use client'

import { VideoSchema } from './schema/video-schema'

interface VideoEmbedProps {
    url: string
    title: string
    description: string
    thumbnailUrl: string
    uploadDate: string
    duration?: string
    className?: string
}

export function VideoEmbed({
    url,
    title,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    className = ''
}: VideoEmbedProps) {
    return (
        <figure className={`my-8 ${className}`}>
            <VideoSchema
                name={title}
                description={description}
                thumbnailUrl={thumbnailUrl}
                uploadDate={uploadDate}
                contentUrl={url}
                embedUrl={url}
                duration={duration}
            />
            <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg border border-border">
                <iframe
                    src={url}
                    title={title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
            {description && (
                <figcaption className="mt-4 text-sm text-muted-foreground text-center">
                    {description}
                </figcaption>
            )}
        </figure>
    )
}
