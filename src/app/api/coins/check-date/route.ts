import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mmdd = searchParams.get("date")?.replace("/", "")
    const year = searchParams.get("year") || new Date().getFullYear().toString()

    if (!mmdd || !/^\d{4}$/.test(mmdd)) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    const existingCoin = await prisma.coin.findFirst({
      where: {
        mmdd,
        year: parseInt(year),
      },
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            wallet: true,
          },
        },
      },
    })

    if (existingCoin) {
      return NextResponse.json({
        available: false,
        owner: existingCoin.owner.wallet,
        coinName: existingCoin.name,
      })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error("Error checking date:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}