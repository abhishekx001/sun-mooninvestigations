'use client'

import { useState, useMemo, useEffect } from 'react'
import { assignAgent } from '@/app/actions/admin'

export default function LocationAgentAssign({ caseId, allAgents, currentAgentId = null, currentTatTarget = '' }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // distinct locations
  const locations = useMemo(() => {
    const locs = allAgents.map(a => a.location).filter(Boolean)
    return [...new Set(locs)]
  }, [allAgents])

  // initial location based on currentAgentId
  const initialLocation = useMemo(() => {
    if (currentAgentId) {
      const agent = allAgents.find(a => a.id === currentAgentId)
      return agent ? agent.location : ''
    }
    return ''
  }, [currentAgentId, allAgents])

  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [selectedAgentId, setSelectedAgentId] = useState(currentAgentId || '')
  
  // filtered agents for the selected location
  const filteredAgents = useMemo(() => {
    return allAgents.filter(a => a.location === selectedLocation)
  }, [selectedLocation, allAgents])

  // auto-select if only one agent
  useEffect(() => {
    if (filteredAgents.length === 1) {
      setSelectedAgentId(filteredAgents[0].id)
    } else if (!filteredAgents.some(a => a.id === selectedAgentId)) {
      setSelectedAgentId('')
    }
  }, [filteredAgents])

  const handleAssign = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const agentId = formData.get('agent_id')
    const tatTarget = formData.get('tat_target')
    
    if (!agentId) return

    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const result = await assignAgent(caseId, agentId, tatTarget)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setIsPending(false)
  }

  return (
    <form onSubmit={handleAssign} className="flex flex-col gap-4 border border-gray-200 p-4 bg-white">
      <div>
        <h3 className="text-sm font-semibold mb-2">Assign Agent</h3>
      </div>
      
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Location</label>
          <select 
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white w-full h-[38px]"
          >
            <option value="" disabled>Select location...</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Agent</label>
          <select 
            name="agent_id" 
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            disabled={!selectedLocation}
            className="border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white w-full h-[38px] disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="" disabled>Select agent...</option>
            {filteredAgents.map(a => (
              <option key={a.id} value={a.id}>
                {a.full_name} {filteredAgents.length > 1 ? `— ${a.open_cases_count} open` : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500 uppercase tracking-wider">Deadline (TAT Target)</label>
          <input 
            type="datetime-local" 
            name="tat_target"
            defaultValue={currentTatTarget ? new Date(currentTatTarget).toISOString().slice(0,16) : ''}
            className="border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white w-full h-[38px]"
            required
          />
        </div>

        <button 
          type="submit"
          disabled={isPending || !selectedAgentId}
          className="px-6 h-[38px] border border-accent bg-accent text-white text-sm hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      {success && <div className="text-green-600 text-sm mt-1">Agent assigned successfully.</div>}
    </form>
  )
}
