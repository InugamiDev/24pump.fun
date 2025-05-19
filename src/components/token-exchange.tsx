"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { connection } from "@/lib/solana"
import { useTFT } from "@/hooks/use-tft"

interface TokenExchangeProps {
  onSuccess?: (signature: string) => void
}

export function TokenExchange({ onSuccess }: TokenExchangeProps) {
  const { connected, publicKey } = useWallet()
  const [amount, setAmount] = useState("")
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const { loading, error, exchange, formattedBalance: tftBalance } = useTFT()

  // Fetch SOL balance
  useEffect(() => {
    if (!connected || !publicKey) {
      setSolBalance(null)
      return
    }

    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey)
        setSolBalance(balance / 1e9) // Convert lamports to SOL
      } catch (err) {
        console.error("Error fetching balance:", err)
      }
    }

    fetchBalance()
    const id = setInterval(fetchBalance, 10000) // Refresh every 10s
    return () => clearInterval(id)
  }, [connected, publicKey])

  const handleExchange = async () => {
    if (!connected || !publicKey) {
      return
    }

    const solAmount = parseFloat(amount)
    if (isNaN(solAmount) || solAmount <= 0) {
      return
    }

    if (solBalance && solAmount > solBalance) {
      return
    }

    try {
      const signature = await exchange(solAmount)
      setAmount("")
      onSuccess?.(signature)
    } catch (err) {
      console.error("Exchange error:", err)
    }
  }

  const isExchangeDisabled = 
    loading || 
    !connected || 
    !amount || 
    isNaN(parseFloat(amount)) || 
    parseFloat(amount) <= 0 ||
    (solBalance !== null && parseFloat(amount) > solBalance)

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Amount (SOL)</Label>
          <div className="space-x-4 text-sm text-muted-foreground">
            <span>SOL: {solBalance?.toFixed(4) || "0.00"}</span>
            <span>TFT: {tftBalance}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            id="amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.1"
            disabled={loading || !connected}
          />
          <Button
            onClick={handleExchange}
            disabled={isExchangeDisabled}
          >
            {loading ? "Exchanging..." : "Exchange"}
          </Button>
        </div>
      </div>

      {/* Exchange Rate */}
      <div className="text-sm text-muted-foreground">
        Rate: 1 SOL = 100 TFT
        {amount && !isNaN(parseFloat(amount)) && (
          <div className="mt-1">
            You will receive:{" "}
            <span className="font-medium text-foreground">
              {(parseFloat(amount) * 100).toFixed(2)} TFT
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}
    </div>
  )
}