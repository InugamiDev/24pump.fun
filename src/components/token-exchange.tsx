"use client"

import { useState, useEffect } from "react"
import { useLazorkitWallet } from "@/components/providers/lazorkit-wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { connection } from "@/lib/solana"
import { useTFT } from "@/hooks/use-tft"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { ExchangeError } from "@/types/errors"

interface TokenExchangeProps {
  onSuccess?: (signature: string) => void
}

export function TokenExchange({ onSuccess }: TokenExchangeProps) {
  const { connected, publicKey } = useLazorkitWallet()
  const [amount, setAmount] = useState("")
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [isTftToSol, setIsTftToSol] = useState(false)
  const { balance: tftBalance, isLoading, error, exchangeToTft, exchangeToSol } = useTFT()

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
        toast.error("Failed to fetch SOL balance")
      }
    }

    fetchBalance()
    const id = setInterval(fetchBalance, 10000) // Refresh every 10s
    return () => clearInterval(id)
  }, [connected, publicKey])

  const handleExchange = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first")
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (isTftToSol) {
      // TFT to SOL exchange
      if (parsedAmount > tftBalance) {
        toast.error("Insufficient TFT balance")
        return
      }
    } else {
      // SOL to TFT exchange
      if (solBalance && parsedAmount > solBalance) {
        toast.error("Insufficient SOL balance")
        return
      }
    }

    try {
      const signature = isTftToSol 
        ? await exchangeToSol(parsedAmount)
        : await exchangeToTft(parsedAmount)
      setAmount("")
      toast.success(`Successfully exchanged ${parsedAmount} ${isTftToSol ? 'TFT to SOL' : 'SOL to TFT'}`)
      onSuccess?.(signature)
    } catch (err) {
      const error = err as ExchangeError
      console.error("Exchange error:", error)
      toast.error(error.message || "Exchange failed. Please try again.")
    }
  }

  const isExchangeDisabled = 
    isLoading || 
    !connected || 
    !amount || 
    isNaN(parseFloat(amount)) || 
    parseFloat(amount) <= 0 ||
    (isTftToSol ? parseFloat(amount) > tftBalance : (solBalance !== null && parseFloat(amount) > solBalance))

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Wallet Status */}
      {!connected && (
        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          Please connect your wallet to exchange tokens
        </div>
      )}

      <div className="space-y-4">
        {/* Exchange direction toggle */}
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label>Exchange Direction</Label>
            <div className="text-sm text-muted-foreground">
              {isTftToSol ? 'TFT → SOL' : 'SOL → TFT'}
            </div>
          </div>
          <Switch
            checked={isTftToSol}
            onCheckedChange={setIsTftToSol}
            disabled={isLoading || !connected}
          />
        </div>
        
        {/* Balances */}
        <div className="flex items-center justify-between">
          <Label htmlFor="amount">Amount ({isTftToSol ? 'TFT' : 'SOL'})</Label>
          {connected ? (
            <div className="space-x-4 text-sm text-muted-foreground">
              <span>SOL: {solBalance?.toFixed(4) || "0.00"}</span>
              <span>TFT: {tftBalance.toLocaleString()}</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Connect wallet to view balances
            </div>
          )}
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
            disabled={isLoading || !connected}
          />
          <Button
            onClick={handleExchange}
            disabled={isExchangeDisabled}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Exchanging</span>
              </div>
            ) : (
              "Exchange"
            )}
          </Button>
        </div>

        {/* Exchange Rate */}
        <div className="text-sm text-muted-foreground">
          {isTftToSol ? 'Rate: 100 TFT = 1 SOL' : 'Rate: 1 SOL = 100 TFT'}
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="mt-1">
              You will receive:{" "}
              <span className="font-medium text-foreground">
                {isTftToSol 
                  ? `${(parseFloat(amount) / 100).toFixed(4)} SOL`
                  : `${(parseFloat(amount) * 100).toFixed(2)} TFT`}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm font-medium text-destructive">{error}</div>
        )}
      </div>
    </div>
  )
}