"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Database } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/workflow/status-badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditorsPickToggle } from "./editors-pick"
import { copyToClipboard } from "@/lib/tracking/utm-builder"

export type Post = Database['public']['Tables']['posts']['Row']

export const columns: ColumnDef<Post>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableHiding: false,
  },
  {
    id: "pick",
    header: "",
    cell: ({ row }) => {
      // Inline component for the toggle to keep it contained
      const post = row.original
      // Check if is_editors_pick exists on the type (Database definition might need update but row.original will have it if DB has it)
      // I'll cast it for now or rely on the updated type if I updated it.
      // Since I haven't updated `database.types.ts` yet, I'll use `any` cast or just access it safely.
      const isPick = (post as any).is_editors_pick

      return (
        <EditorsPickToggle postId={post.id} initialIsPick={!!isPick} />
      )
    },
    enableSorting: false,
    size: 40,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <div className="font-medium font-heading">{row.getValue("title")}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as 'draft' | 'review' | 'approved' | 'published' | 'archived'
      return <StatusBadge status={status} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "views",
    header: "Views",
    cell: ({ row }) => {
      return <div className="text-muted-foreground font-mono text-xs">{row.getValue("views")}</div>
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      return <div className="text-muted-foreground font-mono text-xs">
        {new Date(row.getValue("created_at")).toLocaleDateString()}
      </div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => copyToClipboard(post.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/editor?id=${post.id}`}>Edit Post</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

