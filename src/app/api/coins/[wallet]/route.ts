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

    // Get user and their coins
    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        coins: {
          orderBy: {
            createdAt: "desc",
          },
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
    const formattedCoins = user.coins.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      date: `${coin.mmdd.slice(0, 2)}/${coin.mmdd.slice(2)}`,
      year: coin.year,
      createdAt: coin.createdAt,
      txSignature: coin.txSignature,
    }))

    return NextResponse.json({
      wallet: user.wallet,
      coins: formattedCoins,
      totalCoins: formattedCoins.length,
    })
  } catch (error) {
    console.error("Error fetching coins:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}