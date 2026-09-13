'use client'

import { useState } from 'react'
import { respondToAssignment } from '@/app/actions/agent'

export default function AcceptRejectPrompt({ caseId }) {
  const [isPending, setIsPending] = useState(false)

  const handleResponse = async (status) => {
    setIsPending(true)
    await respondToAssignment(caseId, status)
    setIsPending(false)
  }

  return (
    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-6 border border-gray-200 z-10 backdrop-blur-sm">
      <h4 className="text-lg font-medium text-gray-900 mb-2">New Case Assignment</h4>
      <p className="text-sm text-gray-600 text-center mb-6">Please accept or reject this case assignment.</p>
      
      <div className="flex gap-4 w-full max-w-xs">
        <button 
          onClick={() => handleResponse('rejected')}
          disabled={isPending}
          className="flex-1 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50"
        >
          Reject
        </button>
        <button 
          onClick={() => handleResponse('accepted')}
          disabled={isPending}
          className="flex-1 py-2 border border-accent bg-accent text-white hover:bg-accent-hover text-sm font-medium transition-colors disabled:opacity-50"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
