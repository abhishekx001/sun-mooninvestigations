'use client'

import { useState } from 'react'
import { assignAgent } from '@/app/actions/admin'

export default function AssignAgentForm({ caseId, agents, currentAgentId }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  
  const handleAssign = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const agentId = formData.get('agent_id')
    
    if (!agentId || agentId === currentAgentId) return

    setIsPending(true)
    setError(null)
    
    const result = await assignAgent(caseId, agentId)
    
    if (result.error) {
      setError(result.error)
    }
    
    setIsPending(false)
  }

  return (
    <form onSubmit={handleAssign} className="flex gap-2 items-center">
      <select 
        name="agent_id" 
        defaultValue={currentAgentId || ''}
        className="border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white min-w-[200px]"
      >
        <option value="" disabled>Select an agent...</option>
        {agents.map(a => (
          <option key={a.id} value={a.id}>{a.full_name} ({a.location})</option>
        ))}
      </select>
      <button 
        type="submit"
        disabled={isPending}
        className="px-4 py-2 border border-accent bg-accent text-white text-sm hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {isPending ? 'Assigning...' : 'Assign'}
      </button>
      {error && <span className="text-red-600 text-xs ml-2">{error}</span>}
    </form>
  )
}
