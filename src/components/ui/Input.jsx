import { useId, forwardRef } from 'react'
import { cn } from './cn'

export const Input = forwardRef(function Input(
  { label, error, className, ...props },
  ref,
) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm',
          'placeholder:text-gray-400',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
