'use client'

import { useState, useEffect } from 'react'
import { createCase } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const LOCATIONS = [
  "MADURAI CIRCLE", "TIRUNELVELI CIRCLE", "MYLADURAI", "SALEM CIRCLE", 
  "TIRUPPUR", "COIMBATORE", "THENI", "POLLACHI CIRCLE", "NILGIRIS", 
  "SATHYAMANGALAM", "CUDDALORE, CHENNAI", "THANJAVUR CIRCLE", "CHENNAI", 
  "PALAKKAD", "MALAPPURAM", "TRIVANDRUM", "COCHIN"
]

export default function CreateCaseModal({ preAssignedAgentId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [agents, setAgents] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen && agents.length === 0) {
      supabase
        .from('profiles')
        .select('id, full_name, location')
        .eq('role', 'agent')
        .then(({ data }) => setAgents(data || []))
    }
  }, [isOpen, supabase, agents.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setUploadProgress('Saving case and uploading documents...')
    
    const formData = new FormData(e.currentTarget)
    
    const result = await createCase(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
      setSelectedLocation('')
      if (result.caseId) {
        router.push(`/admin/cases/${result.caseId}`)
      }
    }
    setIsPending(false)
    setUploadProgress('')
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-accent bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        {preAssignedAgentId ? 'Assign New Case' : 'Create Case'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-gray-200 w-full max-w-2xl p-6 relative my-8">
            <h3 className="text-xl font-light text-gray-900 mb-6">
              {preAssignedAgentId ? 'Create & Assign New Case' : 'Create New Investigation Case'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {preAssignedAgentId && (
                <input type="hidden" name="assigned_agent_id" value={preAssignedAgentId} />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Name / Ref</label>
                  <input required type="text" name="case_name" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company (Insurer)</label>
                  <input required type="text" name="company" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim No.</label>
                  <input type="text" name="claim_no" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select 
                    required 
                    name="location" 
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white"
                  >
                    <option value="">Select Location...</option>
                    {LOCATIONS.sort().map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                {!preAssignedAgentId ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent (Optional)</label>
                    <select 
                      name="assigned_agent_id" 
                      disabled={!selectedLocation}
                      className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{selectedLocation ? 'Select an agent...' : 'Select a location first'}</option>
                      {agents.filter(a => a.location === selectedLocation).map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Type</label>
                    <input type="text" name="investigation_type" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                  </div>
                )}

                {!preAssignedAgentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investigation Type</label>
                    <input type="text" name="investigation_type" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FIR No. / Police Station</label>
                  <input type="text" name="fir_no_police_station" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                </div>
                <div className={preAssignedAgentId ? "col-span-1" : "col-span-2"}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TAT Target (Optional Deadline)</label>
                  <input type="datetime-local" name="tat_target" className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none" />
                </div>
                
                <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attach Documents (PDF, Images, Docs)</label>
                  <input 
                    type="file" 
                    name="documents" 
                    multiple 
                    className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer" 
                  />
                  <p className="text-xs text-gray-500 mt-1">These files will be uploaded and shared with the assigned agent.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea name="documents_enclosed" rows={2} className="w-full border border-gray-300 p-2 text-sm focus:border-accent focus:outline-none resize-y" placeholder="Any extra text notes for the agent"></textarea>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <div className="text-sm text-accent font-medium">{uploadProgress}</div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setIsOpen(false); setSelectedLocation(''); }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="px-4 py-2 border border-accent bg-accent text-white text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Create Case'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
