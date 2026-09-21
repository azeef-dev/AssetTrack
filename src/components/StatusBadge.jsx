import { cn } from '@/lib/utils'
import { ASSET_STATUS_COLORS, ISSUE_STATUS_COLORS } from '@/lib/constants'

export function AssetStatusBadge({ status }) {
    return (
        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', ASSET_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200')}>
            {status}
        </span>
    )
}

export function IssueStatusBadge({ status }) {
    return (
        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', ISSUE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border-gray-200')}>
            {status}
        </span>
    )
}