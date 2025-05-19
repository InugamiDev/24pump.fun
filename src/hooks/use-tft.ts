import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { getTFTBalance, formatTFTAmount } from "@/lib/tft-token"

interface UseTFTResult {
  balance: number | null
  formattedBalance: string
  loading: boolean
  error: string | null
  refreshBalance: () => Promise<void>
  exchange: (solAmount: number) => Promise<string>
}

export function useTFT(): UseTFTResult {
  const { connected, publicKey } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalance(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { balance: newBalance } = await getTFTBalance(publicKey.toString())
      setBalance(newBalance)
    } catch (err) {
      console.error("Error fetching TFT balance:", err)
      setError("Failed to fetch TFT balance")
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey])

  // Initial load and periodic refresh
  useEffect(() => {
    refreshBalance()
    const interval = setInterval(refreshBalance, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [refreshBalance])

  // Exchange SOL for TFT
  const exchange = useCallback(async (solAmount: number): Promise<string> => {
    if (!connected || !publicKey) {
      throw new Error("Wallet not connected")
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          solAmount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to exchange tokens")
      }

      // Update balance after exchange
      await refreshBalance()

      return data.signature
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to exchange tokens"
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey, refreshBalance])

  return {
    balance,
    formattedBalance: balance ? formatTFTAmount(balance) : "0.00",
    loading,
    error,
    refreshBalance,
    exchange,
  }
}