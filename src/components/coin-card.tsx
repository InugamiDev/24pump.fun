import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface Coin {
  id: string
  date: string
  name: string
  creator: string
  description: string
}

interface CoinCardProps {
  coin: Coin
}

export function CoinCard({ coin }: CoinCardProps) {
  const date = new Date(coin.date)
  
  return (
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold">{coin.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(date)}
            </p>
          </div>
          <div className="rounded-full bg-secondary/10 px-2 py-1">
            <p className="text-xs font-medium text-secondary">
              MM/DD: {date.getMonth() + 1}/{date.getDate()}
            </p>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {coin.description}
        </p>
      </div>
      <div className="flex items-center justify-between border-t p-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Created by</p>
          <p className="text-sm font-medium">{coin.creator}</p>
        </div>
        <Button asChild>
          <Link href={`/coin/${coin.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  )
}