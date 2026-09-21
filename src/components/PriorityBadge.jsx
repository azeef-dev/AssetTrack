import { cn } from '@/lib/utils'
import { PRIORITY_COLORS } from '@/lib/constants'

export function PriorityBadge({ priority }) {
    return (
        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-700 border-gray-200')}>
            {priority}
        </span>
    )
}