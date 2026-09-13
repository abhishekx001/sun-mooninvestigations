'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCase } from '@/app/actions/admin'
import { Trash2 } from 'lucide-react'

export default function DeleteCaseButton({ caseId }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to completely delete this case? This action cannot be undone and will erase all associated reports and notifications.")) {
      setIsDeleting(true)
      const result = await deleteCase(caseId)
      
      if (result?.error) {
        alert("Failed to delete case: " + result.error)
        setIsDeleting(false)
      } else {
        router.push('/admin/cases')
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? 'Deleting...' : 'Delete Case permanently'}
    </button>
  )
}
