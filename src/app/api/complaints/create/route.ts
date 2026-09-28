import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const assetId = formData.get("assetId") as string
    
    // Default to first user if no robust session
    const user = await prisma.user.findFirst()
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    const complaint = await prisma.complaint.create({
      data: {
        assetId: assetId,
        reporterId: user.id,
        incidentDate: new Date(),
        damageType: "LAINNYA",
        priority: formData.get("priority") as string || "MEDIUM",
        description: formData.get("description") as string,
        status: "OPEN",
      }
    })

    // Update asset condition to RUSAK_RINGAN implicitly if reported
    // Depending on business rules this might be different, but let's assume it gets flagged
    await prisma.asset.update({
      where: { id: assetId },
      data: { condition: "RUSAK_RINGAN" }
    })

    // Log the history automatically
    await prisma.assetHistory.create({
      data: {
        assetId: assetId,
        eventType: "COMPLAINT",
        title: "Pengaduan Kerusakan",
        description: `Dilaporkan kerusakan oleh user. Detail: ${complaint.description}`,
        actorId: user.id
      }
    })

    return NextResponse.redirect(new URL("/dashboard/complaints", request.headers.get("referer") || request.url), 303)
  } catch (error) {
    console.error("Failed to create complaint:", error)
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 })
  }
}
