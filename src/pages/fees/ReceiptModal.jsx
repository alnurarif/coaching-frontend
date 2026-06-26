import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/features/auth/authSlice'

function ReceiptContent({ fee, centerName }) {
  return (
    <div className="p-6 font-sans text-sm text-gray-900 max-w-sm mx-auto">
      <div className="text-center mb-4 border-b border-gray-300 pb-4">
        <h1 className="text-lg font-bold">{centerName}</h1>
        <p className="text-xs text-gray-500 mt-0.5">Fee Payment Receipt</p>
      </div>

      <div className="flex justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500">Receipt No.</p>
          <p className="font-semibold font-mono">{fee.receipt_no}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Date</p>
          <p className="font-semibold">{formatDate(fee.payment_date)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-gray-500">Student</span>
          <span className="font-medium">{fee.student?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Student ID</span>
          <span className="font-mono text-xs">{fee.student?.student_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Batch</span>
          <span className="font-medium">{fee.batch?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Fee Type</span>
          <span className="capitalize">{fee.fee_type}{fee.month ? ` — ${fee.month}` : ''}</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Amount Due</span>
          <span>{formatCurrency(fee.amount_due)}</span>
        </div>
        {fee.discount_amount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount</span>
            <span>— {formatCurrency(fee.discount_amount)}</span>
          </div>
        )}
        {fee.scholarship_amount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Scholarship</span>
            <span>— {formatCurrency(fee.scholarship_amount)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t border-gray-200 pt-1.5">
          <span>Net Payable</span>
          <span>{formatCurrency(fee.net_amount)}</span>
        </div>
        <div className="flex justify-between text-blue-700 font-semibold">
          <span>Amount Paid</span>
          <span>{formatCurrency(fee.amount_paid)}</span>
        </div>
        {fee.balance > 0 && (
          <div className="flex justify-between text-red-600 font-semibold">
            <span>Balance Due</span>
            <span>{formatCurrency(fee.balance)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
        <span>Method: <span className="capitalize font-medium text-gray-700">{fee.payment_method}</span></span>
        <span>Collected by: <span className="font-medium text-gray-700">{fee.collected_by?.name}</span></span>
      </div>

      {fee.note && (
        <p className="text-xs text-gray-500 mt-2 italic">Note: {fee.note}</p>
      )}

      <p className="text-center text-xs text-gray-400 mt-5">Thank you!</p>
    </div>
  )
}

export function ReceiptModal({ open, onClose, fee }) {
  const printRef = useRef(null)
  const user = useSelector(selectCurrentUser)

  const handlePrint = useReactToPrint({ contentRef: printRef })

  if (!fee) return null

  return (
    <Modal open={open} onClose={onClose} title="Payment Receipt" size="sm">
      <div ref={printRef}>
        <ReceiptContent fee={fee} centerName={user?.tenant?.name ?? 'Coaching Center'} />
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 print:hidden">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        <Button type="button" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </Modal>
  )
}
