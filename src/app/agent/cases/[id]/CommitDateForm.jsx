'use client'

import { useState } from 'react'
import { updateCommitDate } from '@/app/actions/agent'

export default function CommitDateForm({ caseId, currentCommitDate, disabled }) {
  const [isPending, setIsPending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const commitDate = formData.get('commit_date')
    
    if (!commitDate) return

    await updateCommitDate(caseId, commitDate)
    
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input 
          type="date" 
          name="commit_date" 
          defaultValue={currentCommitDate || ''}
          disabled={disabled || isPending}
          className="border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none flex-1 bg-white disabled:bg-gray-50"
          required
        />
        <button 
          type="submit"
          disabled={disabled || isPending}
          className="px-4 py-2 border border-accent bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Set Date'}
        </button>
      </div>
      {success && <span className="text-green-600 text-xs mt-1">Updated</span>}
    </form>
  )
}
