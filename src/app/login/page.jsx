import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    } else if (profile?.role === 'agent') {
      redirect('/agent/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <img src="/logo-img.jpeg" alt="Sun Moon Investigators Pvt Ltd" className="w-[200px] mb-4" />
        <h2 className="mt-6 text-center text-2xl font-light tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 uppercase tracking-widest">
          Sun Moon Investigators Pvt Ltd
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-gray-200 sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
