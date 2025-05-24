import { NextResponse, type NextRequest } from "next/server"
import { PublicKey } from "@solana/web3.js"
import { isValidPublicKey } from "@/lib/solana"
import { exchangeSolToTft, exchangeTftToSol, getTftBalance } from "@/lib/tft-token"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, amount, type } = body

    // Validate inputs
    if (!wallet || !amount || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!isValidPublicKey(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    const walletPublicKey = new PublicKey(wallet)

    // Execute exchange based on type
    const signature = type === 'SOL_TO_TFT'
      ? await exchangeSolToTft(walletPublicKey, amount)
      : await exchangeTftToSol(walletPublicKey, amount)

    // Get updated TFT balance
    const balance = await getTftBalance(walletPublicKey)

    return NextResponse.json({
      signature,
      balance,
      formattedBalance: balance.toLocaleString()
    })
  } catch (error) {
    console.error("Error processing exchange:", error)
    return NextResponse.json(
      { error: "Failed to process exchange" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get("wallet")

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    if (!isValidPublicKey(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Get TFT balance
    const walletPublicKey = new PublicKey(wallet)
    const balance = await getTftBalance(walletPublicKey)

    return NextResponse.json({
      balance,
      formattedBalance: balance.toLocaleString()
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    )
  }
}