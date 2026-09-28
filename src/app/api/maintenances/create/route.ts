import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const assetId = formData.get("assetId") as string
    
    const costStr = formData.get("cost") as string
    const cost = costStr ? parseInt(costStr) : 0

    const maintenance = await prisma.maintenance.create({
      data: {
        assetId: assetId,
        type: formData.get("type") as string,
        date: new Date(formData.get("date") as string),
        technician: formData.get("technician") as string,
        cost: cost,
        description: formData.get("description") as string,
        status: "COMPLETED",
      }
    })

    // Log the history automatically
    await prisma.assetHistory.create({
      data: {
        assetId: assetId,
        eventType: "MAINTENANCE",
        title: "Maintenance BMN",
        description: `Dilakukan maintenance ${maintenance.type} oleh ${maintenance.technician}. Deskripsi: ${maintenance.description}`,
      }
    })

    return NextResponse.redirect(new URL("/dashboard/maintenances", request.headers.get("referer") || request.url), 303)
  } catch (error) {
    console.error("Failed to create maintenance:", error)
    return NextResponse.json({ error: "Failed to create maintenance" }, { status: 500 })
  }
}
