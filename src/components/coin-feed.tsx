import { formatDate, shortenAddress } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CoinSkeleton } from "@/components/coin-skeleton"
import { type CoinFeedProps } from "@/types/coin"
import Link from "next/link"

// Example data - In production, this would come from the blockchain
const exampleFeed = [
  {
    id: "1",
    date: "2025-12-25",
    name: "Christmas 2025",
    creator: "0x1234...5678",
    mintedAt: "2025-05-19T08:30:00.000Z",
    description: "The magic of Christmas, preserved on-chain.",
  },
  {
    id: "2",
    date: "2025-01-01",
    name: "New Year 2025",
    creator: "0x8765...4321",
    mintedAt: "2025-05-18T15:45:00.000Z",
    description: "A fresh start, tokenized forever.",
  },
]

export function CoinFeed({ coins = exampleFeed, isLoading }: CoinFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <CoinSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-center text-muted-foreground">
          No coins found. Try adjusting your filters or create your own coin.
        </p>
        <Button asChild>
          <Link href="/create">Create Coin</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Date Circle */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                {new Date(coin.date).getDate()}/{new Date(coin.date).getMonth() + 1}
              </div>
              
              {/* Content */}
              <div className="space-y-1">
                <h3 className="font-bold hover:text-primary">
                  <Link href={`/coin/${coin.id}`}>{coin.name}</Link>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Minted by {shortenAddress(coin.creator)} • {formatDate(new Date(coin.mintedAt))}
                </p>
                <p className="text-sm text-muted-foreground">{coin.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden sm:inline-flex"
              >
                <Link
                  href={`https://solscan.io/tx/${coin.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Solscan
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/coin/${coin.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}