export default function StatusTag({ status }) {
  const config = {
    unassigned: { label: 'Unassigned', border: 'border-slate-400', color: 'text-slate-600' },
    assigned: { label: 'Assigned', border: 'border-blue-500', color: 'text-blue-700' },
    in_progress: { label: 'In Progress', border: 'border-amber-500', color: 'text-amber-700' },
    submitted: { label: 'Submitted', border: 'border-emerald-500', color: 'text-emerald-700' },
    closed: { label: 'Closed', border: 'border-slate-500', color: 'text-slate-600' },
  }

  const { label, border, color } = config[status] || config.unassigned

  return (
    <div className={`inline-flex items-center pl-2 pr-3 py-1 border border-l-4 border-gray-200 ${border} bg-white`}>
      <span className={`text-[10px] font-medium uppercase tracking-wider ${color}`}>
        {label}
      </span>
    </div>
  )
}
