import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Receipt, Loader2 } from 'lucide-react'
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '@/features/expenses/expenseApi'
import { useGetExpenseCategoriesQuery } from '@/features/expenseCategories/expenseCategoryApi'
import { useGetBranchesQuery } from '@/features/branches/branchApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const PAYMENT_LABELS = {
  cash: 'Cash', bkash: 'bKash', nagad: 'Nagad',
  rocket: 'Rocket', bank_transfer: 'Bank Transfer',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}
function monthStart() {
  return new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
}

// ─── Expense Form Modal ───────────────────────────────────────────────────────
function ExpenseModal({ expense, categories, branches, onClose }) {
  const isEdit = !!expense
  const [form, setForm] = useState({
    title:               expense?.title          ?? '',
    amount:              expense?.amount          ?? '',
    expense_date:        expense?.expense_date    ?? today(),
    expense_category_id: expense?.category?.id   ?? '',
    branch_id:           expense?.branch?.id     ?? '',
    payment_method:      expense?.payment_method ?? 'cash',
    reference_no:        expense?.reference_no   ?? '',
    notes:               expense?.notes          ?? '',
  })
  const [errors, setErrors] = useState({})

  const [create, { isLoading: creating }] = useCreateExpenseMutation()
  const [update, { isLoading: updating }] = useUpdateExpenseMutation()
  const isLoading = creating || updating

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim())           e.title        = 'Title is required'
    if (!form.amount || form.amount <= 0) e.amount   = 'Enter a valid amount'
    if (!form.expense_date)           e.expense_date = 'Date is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const payload = {
      title:         form.title,
      amount:        parseFloat(form.amount),
      expense_date:  form.expense_date,
      payment_method: form.payment_method,
      expense_category_id: form.expense_category_id || null,
      branch_id:     form.branch_id || null,
      reference_no:  form.reference_no || null,
      notes:         form.notes || null,
    }

    try {
      if (isEdit) {
        await update({ id: expense.id, ...payload }).unwrap()
        toast.success('Expense updated.')
      } else {
        await create(payload).unwrap()
        toast.success('Expense recorded.')
      }
      onClose()
    } catch (err) {
      const firstError = err?.data?.errors
        ? Object.values(err.data.errors)[0]?.[0]
        : null
      toast.error(firstError ?? err?.data?.message ?? 'Something went wrong.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Expense' : 'Record Expense'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Title *"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Office Rent - June"
            error={errors.title}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (৳) *"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              placeholder="0.00"
              error={errors.amount}
            />
            <Input
              label="Date *"
              type="date"
              value={form.expense_date}
              onChange={e => set('expense_date', e.target.value)}
              error={errors.expense_date}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.expense_category_id}
              onChange={e => set('expense_category_id', e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select
              label="Payment Method"
              value={form.payment_method}
              onChange={e => set('payment_method', e.target.value)}
            >
              {Object.entries(PAYMENT_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Branch"
              value={form.branch_id}
              onChange={e => set('branch_id', e.target.value)}
            >
              <option value="">All / Not specific</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
            <Input
              label="Reference No."
              value={form.reference_no}
              onChange={e => set('reference_no', e.target.value)}
              placeholder="Receipt / Invoice no."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Optional notes…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save Changes' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const [filters, setFilters] = useState({
    category_id: '', date_from: monthStart(), date_to: today(), per_page: 20,
  })
  const [page, setPage]       = useState(1)
  const [modal, setModal]     = useState(null)   // null | 'add' | expense object
  const [deleteTarget, setDeleteTarget] = useState(null)

  const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page }
  const { data, isLoading, isFetching } = useGetExpensesQuery(params)
  const { data: categoriesData } = useGetExpenseCategoriesQuery()
  const { data: branchesData }   = useGetBranchesQuery()

  const categories = categoriesData?.data ?? []
  const branches   = branchesData?.data   ?? []
  const rows       = data?.data           ?? []
  const meta       = data?.meta           ?? {}

  const totalAmount = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0)

  const [deleteExpense, { isLoading: deleting }] = useDeleteExpenseMutation()

  const handleDelete = async () => {
    try {
      await deleteExpense(deleteTarget.id).unwrap()
      toast.success('Expense deleted.')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete expense.')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track all operating expenses for your center.</p>
        </div>
        <Button onClick={() => setModal('add')}>
          <Plus className="h-4 w-4" /> Record Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Category</label>
          <select
            value={filters.category_id}
            onChange={e => { setFilters(f => ({ ...f, category_id: e.target.value })); setPage(1) }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">From</label>
          <input type="date" value={filters.date_from}
            onChange={e => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1) }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">To</label>
          <input type="date" value={filters.date_to}
            onChange={e => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1) }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Showing total</p>
            <p className="text-base font-bold text-red-600">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Ref.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">By</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isLoading || isFetching) ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">
                  No expenses recorded yet.
                </td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.expense_date}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.title}</p>
                    {r.notes && <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.notes}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {r.category ? (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: r.category.color ?? '#6B7280' }}
                        />
                        {r.category.name}
                      </span>
                    ) : <span className="text-gray-400 text-xs">Uncategorized</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="gray">{PAYMENT_LABELS[r.payment_method] ?? r.payment_method}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.reference_no ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-red-600">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.recorded_by?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setModal(r)}
                        className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === 'add' || (modal && modal !== 'add')) && (
        <ExpenseModal
          expense={modal === 'add' ? null : modal}
          categories={categories}
          branches={branches}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Expense"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
