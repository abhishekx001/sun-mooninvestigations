'use client'

import { useState } from 'react'
import { updateAgent } from '@/app/actions/admin'

export default function EditAgentForm({ agent }) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateAgent(agent.id, formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    
    setIsPending(false)
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
          Agent profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input required type="text" name="full_name" defaultValue={agent.full_name} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" name="phone" defaultValue={agent.phone} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input required type="text" name="location" defaultValue={agent.location} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white" />
          <p className="mt-1 text-xs text-amber-600">Note: Changing location does not retroactively move existing assigned cases.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="is_active" defaultValue={agent.is_active ? 'true' : 'false'} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
