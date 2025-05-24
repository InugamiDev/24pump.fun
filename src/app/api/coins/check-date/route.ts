import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      )
    }

    // Parse the date and create start/end of day for the query
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    // Set time to start of day UTC
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Set time to end of day UTC
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingSeries = await prisma.momentCoinSeries.findFirst({
      where: {
        momentDateTimeUTC: {
          gte: startOfDay,
          lte: endOfDay,
        },
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

    if (existingSeries) {
      return NextResponse.json({
        available: false,
        owner: existingSeries.owner.wallet,
        seriesName: existingSeries.name,
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