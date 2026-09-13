export function formatIST(dateString) {
  if (!dateString) return 'None set'
  
  const date = new Date(dateString)
  
  // Check for invalid date
  if (isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true
  })
}
