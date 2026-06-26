import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import StudentsPage from '@/pages/students/StudentsPage'
import StudentProfilePage from '@/pages/students/StudentProfilePage'
import BatchesPage from '@/pages/batches/BatchesPage'
import BatchDetailPage from '@/pages/batches/BatchDetailPage'
import AttendancePage from '@/pages/attendance/AttendancePage'
import FeesPage from '@/pages/fees/FeesPage'
import TeachersPage from '@/pages/teachers/TeachersPage'
import TeacherDetailPage from '@/pages/teachers/TeacherDetailPage'
import BranchPage from '@/pages/branches/BranchPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import StaffPage from '@/pages/staff/StaffPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SubjectsPage from '@/pages/subjects/SubjectsPage'
import ExamsPage from '@/pages/exams/ExamsPage'
import ExamDetailPage from '@/pages/exams/ExamDetailPage'
import ExpensesPage from '@/pages/expenses/ExpensesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<ErrorBoundary><AppLayout /></ErrorBoundary>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/:id" element={<StudentProfilePage />} />
            <Route path="/batches" element={<BatchesPage />} />
            <Route path="/batches/:id" element={<BatchDetailPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/fees" element={<FeesPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/teachers/:id" element={<TeacherDetailPage />} />
            <Route path="/branches" element={<BranchPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/reports"       element={<ReportsPage />} />
            <Route path="/subjects"      element={<SubjectsPage />} />
            <Route path="/exams"         element={<ExamsPage />} />
            <Route path="/exams/:id"     element={<ExamDetailPage />} />
            <Route path="/expenses"      element={<ExpensesPage />} />
            <Route path="/settings"      element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
