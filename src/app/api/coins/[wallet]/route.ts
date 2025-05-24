import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isValidSolanaAddress } from "@/lib/solana"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params
    if (!isValidSolanaAddress(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Get user and their created series
    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        createdSeries: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            socialCause: {
              select: {
                name: true,
                description: true
              }
            }
          }
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      )
    }

    // Format the response
    const formattedSeries = user.createdSeries.map((series) => ({
      id: series.id,
      name: series.name,
      symbol: series.symbol,
      date: series.momentDateTimeUTC,
      narrative: series.narrative,
      totalSupply: series.totalSupply.toString(),
      smartContractAddress: series.smartContractAddress,
      txSignature: series.creationTxSignature,
      socialCause: series.socialCause,
      createdAt: series.createdAt,
    }))

    return NextResponse.json({
      wallet: user.wallet,
      series: formattedSeries,
      totalSeries: formattedSeries.length,
    })
  } catch (error) {
    console.error("Error fetching series:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}