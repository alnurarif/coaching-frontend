import { cn } from './cn'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      {Icon && <Icon className="h-8 w-8 text-gray-300 mb-3" />}
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-3 text-sm text-blue-600 hover:underline font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
