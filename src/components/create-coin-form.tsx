"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useWallet } from "@solana/wallet-adapter-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { calculateRequiredTFT } from "@/lib/tft-token"
import { useTFT } from "@/hooks/use-tft"
import { useDateAvailability } from "@/hooks/use-date-availability"
import { CalendarIcon } from "lucide-react"

export function CreateCoinForm() {
  const { connected, publicKey } = useWallet()
  const { balance } = useTFT()
  const { isChecking, isAvailable, owner, coinName, error: dateError, checkDate } = useDateAvailability()
  const [date, setDate] = useState<Date>()
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredTFT = date ? calculateRequiredTFT(format(date, "MMdd")) : 0
  const hasSufficientBalance = balance !== null && balance >= requiredTFT

  // Check date availability when date changes
  useEffect(() => {
    if (date) {
      checkDate(date)
    }
  }, [date, checkDate])

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first")
      return
    }

    if (!date || !name || !symbol) {
      setError("Please fill in all fields")
      return
    }

    if (!isAvailable) {
      setError("This date is already taken")
      return
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient TFT balance. Required: ${requiredTFT} TFT`)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/coins/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          date: format(date, "MMdd"),
          name,
          symbol,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create coin")
      }

      // Clear form
      setDate(undefined)
      setName("")
      setSymbol("")

      // Redirect to coin page
      window.location.href = `/coin/${data.id}`
    } catch (err) {
      console.error("Create coin error:", err)
      setError(err instanceof Error ? err.message : "Failed to create coin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Select Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => {
                // Only allow current year
                return date.getFullYear() !== new Date().getFullYear()
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {isChecking && (
          <p className="text-sm text-muted-foreground">Checking availability...</p>
        )}
        {!isChecking && date && !isAvailable && (
          <p className="text-sm text-destructive">
            Date already taken by {coinName} (Owner: {owner})
          </p>
        )}
        {dateError && (
          <p className="text-sm text-destructive">{dateError}</p>
        )}
      </div>

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name">Coin Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Christmas 2024"
        />
      </div>

      {/* Symbol Input */}
      <div className="space-y-2">
        <Label htmlFor="symbol">Symbol</Label>
        <Input
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="XMAS24"
          maxLength={8}
        />
      </div>

      {/* Required TFT */}
      {date && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Required TFT:</span>
            <span className="font-medium">
              {requiredTFT} TFT
              {balance !== null && (
                <span className="ml-2 text-sm text-muted-foreground">
                  (Balance: {balance} TFT)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      {/* Submit Button */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={
          loading ||
          !connected ||
          !date ||
          !name ||
          !symbol ||
          !hasSufficientBalance ||
          !isAvailable ||
          isChecking
        }
      >
        {loading ? "Creating..." : "Create Coin"}
      </Button>
    </div>
  )
}