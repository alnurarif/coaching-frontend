import { useId, forwardRef } from 'react'
import { cn } from './cn'

export const Select = forwardRef(function Select(
  { label, error, children, className, placeholder, ...props },
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
      <select
        id={id}
        ref={ref}
        className={cn(
          'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm bg-white',
          'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
})
