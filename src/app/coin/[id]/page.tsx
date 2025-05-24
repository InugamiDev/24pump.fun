import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate, shortenAddress } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const series = await prisma.momentCoinSeries.findUnique({
    where: { id },
    include: {
      owner: true,
      socialCause: true,
    },
  })

  if (!series) {
    return {
      title: "Not Found - 24pump.fun",
      description: "The requested moment coin series could not be found.",
    }
  }

  return {
    title: `${series.name} - 24pump.fun`,
    description: series.narrative,
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CoinPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params
  void searchParams // Allow searchParams to be unused

  const series = await prisma.momentCoinSeries.findUnique({
    where: { id },
    include: {
      owner: true,
      socialCause: true,
    },
  })

  if (!series) {
    notFound()
  }

  const mintDate = new Date(series.momentDateTimeUTC)

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
            <h1 className="text-3xl font-bold">{series.name}</h1>
            <p className="mt-2 text-xl text-muted-foreground">
              {formatDate(mintDate)}
            </p>
          </div>

          {/* Narrative */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-bold">Narrative</h2>
            <p className="mt-2 text-muted-foreground">{series.narrative}</p>
          </div>

          {/* Social Cause */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-bold">Social Cause</h2>
            <div className="mt-2">
              <h3 className="font-semibold">{series.socialCause.name}</h3>
              <p className="text-muted-foreground">{series.socialCause.description}</p>
            </div>
          </div>

          {/* Ownership Details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-bold">Ownership Details</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Creator</span>
                <span className="font-medium">{shortenAddress(series.owner.wallet)}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-medium">{series.totalSupply.toString()}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-muted-foreground">Created On</span>
                <span className="font-medium">{formatDate(series.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creation Transaction</span>
                {series.creationTxSignature ? (
                  <Link
                    href={`https://solscan.io/tx/${series.creationTxSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-secondary hover:underline"
                  >
                    {shortenAddress(series.creationTxSignature)}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link
                href={`https://solscan.io/token/${series.smartContractAddress}`}
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