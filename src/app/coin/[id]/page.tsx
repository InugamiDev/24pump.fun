import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, shortenAddress } from "@/lib/utils"

// Example data - In production, this would come from the blockchain
const exampleCoin = {
  id: "1",
  date: "2025-12-25",
  name: "Christmas 2025",
  creator: "0x1234...5678",
  description: "The magic of Christmas, preserved on-chain.",
  mintedAt: "2025-05-19T08:30:00.000Z",
  transactionHash: "0xabcd...ef12",
}

export const metadata = {
  title: `${exampleCoin.name} - 24pump.fun`,
  description: `View details about the timestamped coin: ${exampleCoin.name}`,
}

// In production, params.id would be used to fetch the specific coin data
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CoinPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  // Allow searchParams to be unused since we don't need it yet
  void searchParams
  // For now use example data, but in production fetch using the id
  const coin = { ...exampleCoin, id }
  const mintDate = new Date(coin.date)
  const mintedAt = new Date(coin.mintedAt)

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-[800px] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/explore"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Explore
          </Link>
          <div className="rounded-full bg-secondary/10 px-3 py-1">
            <p className="text-sm font-medium text-secondary">
              MM/DD: {mintDate.getMonth() + 1}/{mintDate.getDate()}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{coin.name}</h1>
            <p className="mt-2 text-xl text-muted-foreground">
              {formatDate(mintDate)}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-bold">Description</h2>
            <p className="mt-2 text-muted-foreground">{coin.description}</p>
          </div>

          {/* Ownership Details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-bold">Ownership Details</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Creator</span>
                <span className="font-medium">{shortenAddress(coin.creator)}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Minted On</span>
                <span className="font-medium">{formatDate(mintedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction</span>
                <Link
                  href={`https://solscan.io/tx/${coin.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-secondary hover:underline"
                >
                  {shortenAddress(coin.transactionHash)}
                </Link>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link
                href={`https://solscan.io/token/${coin.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Solscan
              </Link>
            </Button>
            <Button asChild>
              <Link href="/create">Mint Your Own</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}