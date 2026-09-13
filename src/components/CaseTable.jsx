import Link from 'next/link'
import StatusTag from './StatusTag'
import DeadlineCountdown from './DeadlineCountdown'

export default function CaseTable({ cases, role = 'admin' }) {
  if (!cases || cases.length === 0) {
    return (
      <div className="border border-gray-200 p-8 text-center bg-white">
        <p className="text-sm text-gray-500">No cases found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-[#FAFAFA]">
            <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Case Reference</th>
            <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
            <th className="p-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4">
                <div className="text-sm font-medium text-gray-900">{c.case_name || c.case_title}</div>
                <div className="text-xs text-gray-500">{c.company || c.client_name} • {c.claim_no || c.policy_number || 'No Claim No'}</div>
              </td>
              <td className="p-4 text-sm text-gray-600">{c.location}</td>
              <td className="p-4">
                <StatusTag status={c.status} />
              </td>
              <td className="p-4">
                <DeadlineCountdown deadline={c.tat_target || c.deadline} />
              </td>
              <td className="p-4 text-right">
                <Link
                  href={`/${role}/cases/${c.id}`}
                  className="text-xs font-medium text-accent hover:text-accent-hover uppercase tracking-wider"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
