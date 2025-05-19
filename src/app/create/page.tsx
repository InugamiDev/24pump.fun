import { TokenExchange } from "@/components/token-exchange"
import { CreateCoinForm } from "@/components/create-coin-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Coin - 24pump.fun",
  description: "Mint your own unique timestamped coin on the Solana blockchain.",
}

export default function CreatePage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Create Your Coin</h1>
          <p className="text-lg text-muted-foreground">
            Mint a unique timestamped coin using TFT tokens. Each date can only be minted once.
          </p>
        </div>

        {/* Token Exchange Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Get TFT Tokens</h2>
          <p className="text-muted-foreground">
            Exchange SOL for TFT tokens to mint your coin. The minting fee varies based on the date&apos;s significance.
          </p>
          <TokenExchange />
        </div>

        {/* Create Coin Form */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Create Your Coin</h2>
          <p className="text-muted-foreground">
            Choose a date and customize your coin. Some dates may have higher minting fees due to their significance.
          </p>
          <CreateCoinForm />
        </div>

        {/* Information */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-medium">Important Information</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Each date (MM/DD) can only be minted once per year</li>
            <li>Special dates (holidays, etc.) have higher minting fees</li>
            <li>Minted coins are stored permanently on the Solana blockchain</li>
            <li>Make sure you have enough TFT tokens before minting</li>
          </ul>
        </div>
      </div>
    </div>
  )
}