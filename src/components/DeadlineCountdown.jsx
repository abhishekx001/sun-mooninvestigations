'use client'

import { useEffect, useState } from 'react'

export default function DeadlineCountdown({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (!deadline) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const end = new Date(deadline)
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft('Overdue')
        setIsWarning(true)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      
      // Warning if less than 24 hours left
      setIsWarning(difference < 24 * 60 * 60 * 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else {
        const minutes = Math.floor((difference / 1000 / 60) % 60)
        setTimeLeft(`${hours}h ${minutes}m`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [deadline])

  if (!deadline) return <span className="text-sm text-gray-400">No deadline</span>

  return (
    <span className={`text-sm ${isWarning ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
      {timeLeft}
    </span>
  )
}
