import { formatDate, shortenAddress } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CoinGridSkeleton } from "@/components/coin-skeleton"
import { type CoinGridProps } from "@/types/coin"
import Link from "next/link"

// Using the same example data as CoinFeed
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

export function CoinGrid({ coins = exampleFeed, isLoading }: CoinGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <CoinGridSkeleton key={i} />
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm"
        >
          {/* Date Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                {new Date(coin.date).getDate()}/{new Date(coin.date).getMonth() + 1}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold hover:text-primary">
                  <Link href={`/coin/${coin.id}`}>{coin.name}</Link>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatDate(new Date(coin.date))}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {coin.description}
          </p>

          {/* Creator and Actions */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Minted by {shortenAddress(coin.creator)}
              <br />
              {formatDate(new Date(coin.mintedAt))}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-1"
              >
                <Link
                  href={`https://solscan.io/tx/${coin.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solscan
                </Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href={`/coin/${coin.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}