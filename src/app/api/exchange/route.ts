import { NextResponse, type NextRequest } from "next/server"
import { isValidSolanaAddress } from "@/lib/solana"
import { exchangeSOLtoTFT, getTFTBalance } from "@/lib/tft-token"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, solAmount } = body

    // Validate inputs
    if (!wallet || !solAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!isValidSolanaAddress(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Validate amount
    if (solAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      )
    }

    // Execute exchange
    const signature = await exchangeSOLtoTFT({
      userAddress: wallet,
      solAmount,
    })

    // Get updated TFT balance
    const tftBalance = await getTFTBalance(wallet)

    return NextResponse.json({
      signature,
      tftBalance: tftBalance.balance,
      formattedBalance: tftBalance.formattedBalance,
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

    if (!isValidSolanaAddress(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Get TFT balance
    const balance = await getTFTBalance(wallet)

    return NextResponse.json(balance)
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    )
  }
}