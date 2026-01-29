import { Zap } from "lucide-react"

interface KeyTakeawaysProps {
    takeaways: string[]
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
    if (!takeaways || takeaways.length === 0) return null

    return (
        <div className="my-8 p-6 bg-secondary/30 border-l-4 border-primary rounded-r-lg">
            <div className="flex items-center gap-2 mb-4 text-primary font-bold uppercase tracking-wide text-sm">
                <Zap className="w-4 h-4 fill-primary" />
                <span>Key Takeaways</span>
            </div>
            <ul className="space-y-3">
                {takeaways.map((point, index) => (
                    <li key={index} className="flex gap-3 text-lg font-medium leading-relaxed text-foreground/90">
                        <span className="text-primary/50 select-none">•</span>
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    )
}
