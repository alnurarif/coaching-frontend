import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from './cn'

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page, last_page, total, per_page, from, to } = meta

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-gray-500">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={current_page === 1}
          onClick={() => onPageChange(current_page - 1)}
          className={cn(
            'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors',
            'disabled:opacity-40 disabled:pointer-events-none',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm text-gray-700 px-2">
          {current_page} / {last_page}
        </span>
        <button
          type="button"
          disabled={current_page === last_page}
          onClick={() => onPageChange(current_page + 1)}
          className={cn(
            'p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors',
            'disabled:opacity-40 disabled:pointer-events-none',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
