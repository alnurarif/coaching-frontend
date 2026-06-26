import { Modal } from './Modal'
import { Button } from './Button'

const confirmVariants = {
  danger:  'danger',
  success: 'primary',
  primary: 'primary',
}

export function ConfirmDialog({ open, onClose, onConfirm, isLoading, title, message, confirmLabel = 'Confirm', confirmVariant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600">{message}</p>
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={confirmVariants[confirmVariant]}
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
