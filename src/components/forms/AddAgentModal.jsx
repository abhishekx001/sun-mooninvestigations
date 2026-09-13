'use client'

import { useState } from 'react'
import { createAgent } from '@/app/actions/admin'

export default function AddAgentModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createAgent(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
    }
    setIsPending(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-accent bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Add Agent
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 w-full max-w-md p-6 relative">
            <h3 className="text-xl font-light text-gray-900 mb-6">Add New Agent</h3>
            
            {error && (
              <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="full_name" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" name="email" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input required type="text" name="password" minLength={6} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                <p className="mt-1 text-xs text-gray-500">Visible so you can copy it and securely share it with the agent.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (Branch)</label>
                <input required type="text" name="location" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" name="phone" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-4 py-2 border border-accent bg-accent text-white text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
