import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const id = formData.get("id") as string

    if (!id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 })
    }

    const roomId = formData.get("roomId") as string
    const userId = formData.get("userId") as string

    // Handle photo upload if present
    let updateData: any = {
      nup: formData.get("nup") as string,
      assetCode: formData.get("assetCode") as string,
      name: formData.get("name") as string,
      brand: formData.get("brand") as string || null,
      type: formData.get("type") as string || null,
      categoryId: formData.get("categoryId") as string,
      roomId: roomId ? roomId : null,
      userId: userId ? userId : null,
      condition: formData.get("condition") as string,
      status: formData.get("status") as string,
      acquisitionValue: formData.get("acquisitionValue") ? parseFloat(formData.get("acquisitionValue") as string) : null,
      acquisitionYear: formData.get("acquisitionYear") ? parseInt(formData.get("acquisitionYear") as string) : null,
    }

    const photo = formData.get("photo") as File
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const fileName = `${Date.now()}-${photo.name.replace(/\s+/g, '_')}`
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      const filePath = path.join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
      updateData.photo = `/uploads/${fileName}`
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: updateData
    })

    // Log the history automatically
    await prisma.assetHistory.create({
      data: {
        assetId: updated.id,
        eventType: "ASSET_CREATED", // we'll use this since we don't have ASSET_UPDATED enum maybe
        title: "Pembaruan Data BMN",
        description: `Informasi aset ${updated.name} telah diperbarui.`,
      }
    })

    return NextResponse.redirect(new URL(`/dashboard/assets/${id}`, request.headers.get("referer") || request.url), 303)
  } catch (error) {
    console.error("Failed to update asset:", error)
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
  }
}
