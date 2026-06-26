import { useState } from 'react'
import { ClipboardCheck, GraduationCap, AlertCircle } from 'lucide-react'
import { StudentAttendanceTab } from './StudentAttendanceTab'
import { TeacherAttendanceTab } from './TeacherAttendanceTab'
import { AbsentListTab } from './AbsentListTab'
import { cn } from '@/components/ui/cn'

const TABS = [
  { key: 'student',  label: 'Student Attendance', icon: ClipboardCheck },
  { key: 'teacher',  label: 'Teacher Attendance', icon: GraduationCap },
  { key: 'absent',   label: 'Absent List',         icon: AlertCircle },
]

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('student')

  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Attendance</h2>
        <p className="text-sm text-gray-500 mt-0.5">Mark and track daily attendance</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'student' && <StudentAttendanceTab />}
      {activeTab === 'teacher' && <TeacherAttendanceTab />}
      {activeTab === 'absent'  && <AbsentListTab />}
    </div>
  )
}
