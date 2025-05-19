import { NextResponse, type NextRequest } from "next/server"
import { isValidSolanaAddress } from "@/lib/solana"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, date, name, symbol } = body

    // Validate inputs
    if (!wallet || !date || !name || !symbol) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate Solana address
    if (!isValidSolanaAddress(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Parse MMDD and validate
    const mmdd = date.replace("/", "")
    if (!/^\d{4}$/.test(mmdd)) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    const currentYear = new Date().getFullYear()

    // Check if date is already taken
    const existingCoin = await prisma.coin.findFirst({
      where: {
        mmdd,
        year: currentYear,
      },
    })

    if (existingCoin) {
      return NextResponse.json(
        { error: "Date already taken" },
        { status: 400 }
      )
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet },
    })

    // TODO: Call Solana contract to mint token
    const txSignature = "mock_tx_signature" // Replace with actual tx

    // Create coin record
    const coin = await prisma.coin.create({
      data: {
        ownerId: user.id,
        name,
        symbol,
        mmdd,
        year: currentYear,
        txSignature,
      },
    })

    return NextResponse.json(coin)
  } catch (error) {
    console.error("Error creating coin:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}