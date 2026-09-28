import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Ambil 20 notifikasi terbaru
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Fetch notifications error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
