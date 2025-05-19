import { useState } from "react"
import { format } from "date-fns"

interface UseDateAvailabilityResult {
  isChecking: boolean
  isAvailable: boolean | null
  owner: string | null
  coinName: string | null
  error: string | null
  checkDate: (date: Date) => Promise<void>
}

export function useDateAvailability(): UseDateAvailabilityResult {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [owner, setOwner] = useState<string | null>(null)
  const [coinName, setCoinName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkDate = async (date: Date) => {
    setIsChecking(true)
    setError(null)
    setIsAvailable(null)
    setOwner(null)
    setCoinName(null)

    try {
      const response = await fetch(
        `/api/coins/check-date?date=${format(date, "MMdd")}&year=${date.getFullYear()}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check date availability")
      }

      setIsAvailable(data.available)
      if (!data.available) {
        setOwner(data.owner)
        setCoinName(data.coinName)
      }
    } catch (err) {
      console.error("Error checking date:", err)
      setError(err instanceof Error ? err.message : "Failed to check date")
    } finally {
      setIsChecking(false)
    }
  }

  return {
    isChecking,
    isAvailable,
    owner,
    coinName,
    error,
    checkDate,
  }
}