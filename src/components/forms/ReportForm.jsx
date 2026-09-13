'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ReportForm({ caseId, onSubmitReport }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState(null)

  const onSubmit = async (data, event) => {
    setError(null)
    const isFinal = event.nativeEvent.submitter.name === 'final'
    
    try {
      await onSubmitReport({
        ...data,
        isFinal
      })
      reset()
    } catch (err) {
      setError(err.message || 'Failed to submit report')
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Update or Report</h3>
      
      {error && (
        <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="update_text" className="block text-sm font-medium text-gray-700 mb-1">
            Notes / Update
          </label>
          <textarea
            id="update_text"
            rows={5}
            {...register('update_text', { required: 'Notes are required' })}
            className="w-full border border-gray-300 p-3 text-sm focus:border-accent focus:outline-none focus:ring-0 resize-y"
            placeholder="Enter your investigation findings or progress update here..."
          />
          {errors.update_text && (
            <p className="mt-1 text-xs text-red-600">{errors.update_text.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (Optional)
          </label>
          <input
            type="file"
            id="attachments"
            multiple
            {...register('attachments')}
            className="w-full border border-gray-300 p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            name="update"
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Progress Update'}
          </button>
          <button
            type="submit"
            name="final"
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 border border-accent bg-accent text-white text-sm font-medium hover:bg-accent-hover focus:outline-none transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Final Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
