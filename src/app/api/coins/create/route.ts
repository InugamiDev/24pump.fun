import { NextResponse, type NextRequest } from "next/server"
import { isValidSolanaAddress } from "@/lib/solana"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      wallet, 
      name, 
      symbol, 
      momentDateTimeUTC, 
      narrative,
      totalSupply,
      socialCauseId,
      smartContractAddress,
      creationTxSignature 
    } = body

    // Validate required inputs
    if (!wallet || !name || !symbol || !momentDateTimeUTC || !socialCauseId || !smartContractAddress) {
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

    // Check if smart contract address is already used
    const existingSeries = await prisma.momentCoinSeries.findUnique({
      where: {
        smartContractAddress,
      },
    })

    if (existingSeries) {
      return NextResponse.json(
        { error: "Smart contract address already in use" },
        { status: 400 }
      )
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet },
    })

    // Create series record
    const series = await prisma.momentCoinSeries.create({
      data: {
        ownerId: user.id,
        name,
        symbol,
        momentDateTimeUTC: new Date(momentDateTimeUTC),
        narrative: narrative || "",
        totalSupply: BigInt(totalSupply || 0),
        smartContractAddress,
        creationTxSignature,
        socialCauseId,
      },
      include: {
        socialCause: {
          select: {
            name: true,
            description: true
          }
        }
      }
    })

    return NextResponse.json(series)
  } catch (error) {
    console.error("Error creating series:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}