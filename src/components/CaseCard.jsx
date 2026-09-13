import Link from 'next/link'
import StatusTag from './StatusTag'
import DeadlineCountdown from './DeadlineCountdown'
import { MapPin, Clock } from 'lucide-react'

export default function CaseCard({ caseItem }) {
  return (
    <div className="bg-white border border-gray-200 p-5 hover:border-gray-300 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{caseItem.case_name || caseItem.case_title}</h3>
          <p className="text-sm text-gray-500 mt-1">{caseItem.company || caseItem.client_name} • {caseItem.claim_no || caseItem.policy_number}</p>
        </div>
        <StatusTag status={caseItem.status} />
      </div>
      
      <div className="mt-auto space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {caseItem.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <DeadlineCountdown deadline={caseItem.tat_target || caseItem.deadline} />
        </div>
      </div>
      
      <div className="mt-6">
        <Link 
          href={`/agent/cases/${caseItem.id}`}
          className="block w-full py-2 px-4 border border-accent text-accent text-center text-sm uppercase tracking-wider font-medium hover:bg-accent hover:text-white transition-colors"
        >
          View Case Details
        </Link>
      </div>
    </div>
  )
}
