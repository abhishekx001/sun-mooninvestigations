import { createClient } from '@/utils/supabase/server'
import CaseTable from '@/components/CaseTable'
import CreateCaseModal from '@/components/forms/CreateCaseModal'

export default async function AdminCasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select(`
      id,
      case_name,
      company,
      claim_no,
      location,
      status,
      tat_target
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">Cases</h2>
          <p className="mt-1 text-sm text-gray-500">All investigation cases.</p>
        </div>
        <CreateCaseModal />
      </div>

      <CaseTable cases={cases} role="admin" />
    </div>
  )
}
