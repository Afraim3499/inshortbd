
'use client'

import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getTeamMembers } from '@/app/actions/admin/team'

interface Profile {
    id: string
    full_name: string | null
    email: string | null
}

interface AuthorSelectorProps {
    value: string | null
    onChange: (value: string) => void
    disabled?: boolean
}

export function AuthorSelector({ value, onChange, disabled }: AuthorSelectorProps) {
    const [authors, setAuthors] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadAuthors() {
            try {
                const data = await getTeamMembers()
                setAuthors(data as Profile[])
            } catch (err) {
                console.error('Failed to load authors', err)
            } finally {
                setLoading(false)
            }
        }
        loadAuthors()
    }, [])

    return (
        <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled || loading}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Loading authors..." : "Select an author"} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="team_inshort">Team Inshort</SelectItem>
                {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                        {author.full_name || author.email || 'Unknown'}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
