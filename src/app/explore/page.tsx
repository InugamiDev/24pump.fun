import { type Metadata } from "next"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Explore Calendar - 24pump.fun",
  description: "Explore available dates and mint your own timestamped coin",
}

// Example data - In production, this would come from the blockchain
const mintedDates = [
  new Date("2024-12-25"), // Christmas
  new Date("2024-01-01"), // New Year
  new Date("2024-02-14"), // Valentine's
  new Date("2024-07-04"), // Independence Day
]

export default function ExplorePage() {
  const today = new Date()
  const currentYear = today.getFullYear()

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Explore Calendar</h1>
          <p className="text-lg text-muted-foreground">
            Browse available dates and claim your special moment
          </p>
        </div>

        {/* Calendar Section */}
        <div className="rounded-lg border bg-card p-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Calendar
                mode="single"
                selected={undefined}
                disabled={(date) => {
                  // Only allow current year
                  if (date.getFullYear() !== currentYear) return true
                  
                  // Check if date is already minted
                  return mintedDates.some(
                    (mintedDate) =>
                      mintedDate.getMonth() === date.getMonth() &&
                      mintedDate.getDate() === date.getDate()
                  )
                }}
                className="rounded-md border"
                modifiers={{
                  minted: mintedDates,
                }}
                modifiersStyles={{
                  minted: {
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-foreground)",
                  },
                }}
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Date Availability</h2>
                <p className="mt-2 text-muted-foreground">
                  Choose any available date from {currentYear} to mint your unique timestamped coin.
                  Each date can only be minted once.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Legend:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-primary" />
                    <span className="text-sm">Already Minted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border" />
                    <span className="text-sm">Available to Mint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <span className="text-sm">Not Available (Past/Future)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Popular Dates:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Holidays and celebrations</li>
                  <li>• Historical events</li>
                  <li>• Personal milestones</li>
                  <li>• Cultural significance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/discover">View Minted Coins</Link>
          </Button>
          <Button asChild>
            <Link href="/create">Create Your Coin</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}