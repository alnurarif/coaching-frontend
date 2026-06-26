import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, User, Camera, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetStudentQuery,
  useUploadStudentPhotoMutation,
  useDeleteStudentPhotoMutation,
} from '@/features/students/studentApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StudentFormModal } from './StudentFormModal'
import { formatDate } from '@/utils/formatDate'

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 col-span-2">{value || '—'}</span>
    </div>
  )
}

export default function StudentProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const fileInputRef = useRef(null)

  const { data, isLoading, isError } = useGetStudentQuery(id)
  const student = data?.data

  const [uploadPhoto, { isLoading: uploading }] = useUploadStudentPhotoMutation()
  const [deletePhoto, { isLoading: deletingPhoto }] = useDeleteStudentPhotoMutation()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('photo', file)
    try {
      await uploadPhoto({ id, formData }).unwrap()
      toast.success('Photo updated.')
    } catch {
      toast.error('Failed to upload photo. Max 2MB, JPG/PNG/WebP only.')
    }
    e.target.value = ''
  }

  const handleDeletePhoto = async () => {
    try {
      await deletePhoto(id).unwrap()
      toast.success('Photo removed.')
    } catch {
      toast.error('Failed to remove photo.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load student. Please try again.</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Student not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Avatar with upload overlay */}
        <div className="relative group">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-50 border-2 border-gray-200 flex items-center justify-center">
            {(uploading || deletingPhoto) ? (
              <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
            ) : student.photo ? (
              <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-7 w-7 text-blue-300" />
            )}
          </div>
          {/* Upload overlay */}
          {!uploading && !deletingPhoto && (
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-full text-white hover:text-blue-200 transition-colors"
                title="Upload photo"
              >
                <Camera className="h-4 w-4" />
              </button>
              {student.photo && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="p-1 rounded-full text-white hover:text-red-300 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
          <p className="text-sm text-gray-500 font-mono">{student.student_id}</p>
        </div>
        <Badge variant={student.status === 'active' ? 'success' : 'gray'}>
          {student.status}
        </Badge>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Student Details
          </h3>
          {student.photo && (
            <div className="flex justify-center mb-4">
              <img
                src={student.photo}
                alt={student.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
          )}
          <div className="space-y-0">
            <DetailRow label="Full Name" value={student.name} />
            <DetailRow label="Student ID" value={student.student_id} />
            <DetailRow label="Date of Birth" value={formatDate(student.date_of_birth)} />
            <DetailRow label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
            <DetailRow label="Phone" value={student.phone} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow label="Address" value={student.address} />
            <DetailRow label="Admission Date" value={formatDate(student.admission_date)} />
            <DetailRow label="Branch" value={student.branch?.name} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Guardian Details
          </h3>
          {student.guardian ? (
            <div className="space-y-0">
              <DetailRow label="Name" value={student.guardian.name} />
              <DetailRow label="Relation" value={student.guardian.relation ? student.guardian.relation.charAt(0).toUpperCase() + student.guardian.relation.slice(1) : null} />
              <DetailRow label="Phone" value={student.guardian.phone} />
              <DetailRow label="Email" value={student.guardian.email} />
              <DetailRow label="Occupation" value={student.guardian.occupation} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">No guardian information added.</p>
          )}
        </div>
      </div>

      <StudentFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        student={student}
      />
    </div>
  )
}
