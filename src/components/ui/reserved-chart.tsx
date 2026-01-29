import { cn } from "@/lib/utils"

interface ReservedChartProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
    aspectRatio?: string // e.g. "16/9", "4/3"
    minHeight?: number | string
    className?: string
}

export function ReservedChart({
    children,
    aspectRatio = "16/9",
    minHeight = "400px",
    className,
    ...props
}: ReservedChartProps) {
    return (
        <div
            className={cn(
                "w-full relative overflow-hidden bg-muted/20 border border-border/50 rounded-lg",
                className
            )}
            style={{
                aspectRatio: aspectRatio,
                minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
            }}
            {...props}
        >
            {/* 
        This wrapper ensures content loads without layout shift.
        If children are present (chart loaded), they fill the space.
        If loading, the skeleton (bg-muted) holds the aspect ratio.
      */}
            {children ? (
                <div className="absolute inset-0 w-full h-full">
                    {children}
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 text-sm font-medium animate-pulse">
                    উপাত্ত লোড হচ্ছে...
                </div>
            )}
        </div>
    )
}
