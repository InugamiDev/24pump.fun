import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "How It Works - 24pump.fun",
  description: "Learn how to mint and own your piece of time on the blockchain",
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="relative flex gap-6 rounded-lg border bg-card p-6 text-card-foreground">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
        {number}
      </div>
      <div className="space-y-2">
        <h3 className="font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default function HowItWorksPage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">How 24pump.fun Works</h1>
          <p className="text-xl text-muted-foreground">
            Your guide to minting and owning timestamped coins on the blockchain
          </p>
        </div>

        <div className="space-y-8">
          <StepCard
            number={1}
            title="Connect Your Wallet"
            description="Start by connecting your Solana wallet. We support popular wallets like Phantom and Solflare."
          />
          <StepCard
            number={2}
            title="Select Your Date"
            description="Choose any available date from the calendar. Each date can only be minted once, making your coin truly unique."
          />
          <StepCard
            number={3}
            title="Get $TFT Tokens"
            description="$TFT is the utility token used for minting coins. Exchange SOL for $TFT to start minting."
          />
          <StepCard
            number={4}
            title="Create Your Coin"
            description="Pay the minting fee in $TFT to create your timestamped coin. Once minted, it exists permanently on the blockchain."
          />
          <StepCard
            number={5}
            title="Build Your Story"
            description="Your coin represents a moment in time. Add meaning by connecting it to personal milestones, cultural events, or speculative opportunities."
          />
        </div>

        <div className="space-y-8 rounded-lg border bg-card p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Understanding $TFT</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                $TFT (Time Fragment Token) is the native currency of 24pump.fun.
                It serves multiple purposes:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Required for minting new timestamped coins</li>
                <li>Governs access to exclusive features</li>
                <li>Creates a sustainable economy around temporal ownership</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Token Economics</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-foreground">•</span>
                Fixed supply to maintain scarcity
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground">•</span>
                Minting fees create natural token circulation
              </li>
              <li className="flex items-start gap-3">
                <span className="text-foreground">•</span>
                Deflationary mechanism through date minting
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center">
          <Button size="lg" asChild>
            <Link href="/create">Start Creating</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}