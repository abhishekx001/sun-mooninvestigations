'use client'

import { useState } from 'react'
import { updateCase } from '@/app/actions/admin'

export default function EditCaseForm({ caseItem }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateCase(caseItem.id, formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setIsPending(false)
  }

  // Format date for datetime-local input
  const formatForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    // Adjust for local timezone offset to display correctly in datetime-local
    const tzOffset = date.getTimezoneOffset() * 60000
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16)
    return localISOTime
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 border border-green-200 bg-green-50 text-green-700 text-sm">
          Case details updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Case Name / Ref</label>
          <input required type="text" name="case_name" defaultValue={caseItem.case_name} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company (Insurer)</label>
          <input required type="text" name="company" defaultValue={caseItem.company} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Claim No.</label>
          <input type="text" name="claim_no" defaultValue={caseItem.claim_no} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input required type="text" name="location" defaultValue={caseItem.location} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Type</label>
          <input type="text" name="investigation_type" defaultValue={caseItem.investigation_type} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">FIR No. / Police Station</label>
          <input type="text" name="fir_no_police_station" defaultValue={caseItem.fir_no_police_station} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TAT Target (Deadline)</label>
          <input type="datetime-local" name="tat_target" defaultValue={formatForInput(caseItem.tat_target)} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Documents Enclosed</label>
          <textarea name="documents_enclosed" defaultValue={caseItem.documents_enclosed} rows={3} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white resize-y"></textarea>
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="px-6 py-2 border border-accent bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
