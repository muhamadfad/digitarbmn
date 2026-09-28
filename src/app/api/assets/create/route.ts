import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    let categoryId = formData.get("categoryId") as string
    if (!categoryId) {
      const firstCategory = await prisma.category.findFirst()
      categoryId = firstCategory?.id || ""
    }

    let assetTypeId = formData.get("assetTypeId") as string
    if (!assetTypeId) {
      const firstType = await prisma.assetType.findFirst()
      assetTypeId = firstType?.id || ""
    }

    const roomId = formData.get("roomId") as string
    const userId = formData.get("userId") as string
    
    // Handle photo upload
    let photoPath = null
    const photo = formData.get("photo") as File
    if (photo && photo.size > 0) {
      const bytes = await photo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const fileName = `${Date.now()}-${photo.name.replace(/\s+/g, '_')}`
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      const filePath = path.join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
      photoPath = `/uploads/${fileName}`
    }

    const asset = await prisma.asset.create({
      data: {
        nup: formData.get("nup") as string,
        assetCode: formData.get("assetCode") as string,
        qrCode: (formData.get("qrCode") as string)?.trim() || null,
        name: formData.get("name") as string,
        brand: formData.get("brand") as string || null,
        type: formData.get("type") as string || null,
        categoryId: categoryId,
        assetTypeId: assetTypeId,
        roomId: roomId ? roomId : null,
        userId: userId ? userId : null,
        condition: formData.get("condition") as string,
        status: formData.get("status") as string,
        acquisitionValue: formData.get("acquisitionValue") ? parseFloat(formData.get("acquisitionValue") as string) : null,
        acquisitionYear: formData.get("acquisitionYear") ? parseInt(formData.get("acquisitionYear") as string) : null,
        photo: photoPath,
      }
    })

    // Log the history automatically
    await prisma.assetHistory.create({
      data: {
        assetId: asset.id,
        eventType: "ASSET_CREATED",
        title: "Pendaftaran BMN Baru",
        description: `Aset ${asset.name} dengan NUP ${asset.nup} didaftarkan ke sistem.`,
      }
    })

    return NextResponse.redirect(new URL("/dashboard/assets", request.headers.get("referer") || request.url), 303)
  } catch (error) {
    console.error("Failed to create asset:", error)
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 })
  }
}
