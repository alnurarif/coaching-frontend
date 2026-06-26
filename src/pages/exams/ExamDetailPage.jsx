import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, ClipboardList, BarChart2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useGetExamQuery } from '@/features/exams/examApi'
import { ExamFormModal } from './ExamFormModal'
import { OverviewTab }    from './tabs/OverviewTab'
import { MarksEntryTab }  from './tabs/MarksEntryTab'
import { ResultSheetTab } from './tabs/ResultSheetTab'
import { MeritListTab }   from './tabs/MeritListTab'

const STATUS_BADGE = { draft: 'gray', published: 'info', completed: 'success' }
const TABS = [
  { id: 'overview', label: 'Overview',     Icon: ClipboardList },
  { id: 'marks',    label: 'Marks Entry',  Icon: Pencil },
  { id: 'results',  label: 'Result Sheet', Icon: BarChart2 },
  { id: 'merit',    label: 'Merit List',   Icon: Trophy },
]

export default function ExamDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [editOpen, setEditOpen]   = useState(false)

  const { data, isLoading, isError } = useGetExamQuery(id)
  const exam = data?.data

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  if (isError) return <div className="p-6"><p className="text-red-500">Failed to load exam. Please try again.</p></div>
  if (!exam)   return <div className="p-6"><p className="text-gray-500">Exam not found.</p></div>

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate">{exam.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {exam.batch?.name}
            {exam.subject?.name && ` · ${exam.subject.name}`}
            {exam.exam_type?.name && ` · ${exam.exam_type.name}`}
          </p>
        </div>
        <Badge variant={STATUS_BADGE[exam.status] ?? 'gray'} className="capitalize shrink-0">
          {exam.status}
        </Badge>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex border-b border-gray-200">
          {TABS.map(({ id: tabId, label, Icon }) => (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tabId
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab exam={exam} />}
          {activeTab === 'marks'    && <MarksEntryTab exam={exam} />}
          {activeTab === 'results'  && <ResultSheetTab exam={exam} />}
          {activeTab === 'merit'    && <MeritListTab exam={exam} />}
        </div>
      </div>

      <ExamFormModal open={editOpen} onClose={() => setEditOpen(false)} exam={exam} />
    </div>
  )
}
