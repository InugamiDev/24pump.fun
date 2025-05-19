import { CreateCoinForm } from "@/components/create-coin-form"

export const metadata = {
  title: "Create Coin - 24pump.fun",
  description: "Mint a unique timestamped coin tied to your special date.",
}

export default function CreatePage() {
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px]">
        <div className="flex flex-col gap-4">
          <h1 className="text-center text-3xl font-bold md:text-4xl">
            Create Your Timestamped Coin
          </h1>
          <p className="text-center text-muted-foreground">
            Choose a date that matters to you and mint it as a unique digital asset on the Solana blockchain.
          </p>
        </div>
        <div className="mt-8">
          <CreateCoinForm />
        </div>
      </div>
    </div>
  )
}