import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const formData = await request.formData()
    const assetId = formData.get("assetId") as string
    
    // Cari admin untuk diberi notifikasi
    const admin = await prisma.user.findFirst({
      where: { role: { name: 'ADMIN' } }
    })

    const borrowing = await prisma.$transaction(async (tx) => {
      // Pastikan aset masih tersedia (mencegah double-click / double submit)
      const assetCheck = await tx.asset.findUnique({ where: { id: assetId } })
      if (!assetCheck || assetCheck.status !== "TERSEDIA") {
        throw new Error("Aset ini sudah diajukan peminjaman oleh orang lain atau sedang diproses.")
      }

      const b = await tx.borrowing.create({
        data: {
          assetId: assetId,
          userId: userId,
          borrowDate: new Date(formData.get("borrowDate") as string),
          estReturnDate: new Date(formData.get("returnDate") as string),
          purpose: formData.get("purpose") as string,
          status: "MENUNGGU_PERSETUJUAN",
        }
      })

      // Update asset status temporarily
      await tx.asset.update({
        where: { id: assetId },
        data: { status: "DIPROSES" }
      })

      // Audit Log
      await tx.auditLog.create({
        data: {
          assetId: assetId,
          userId: userId,
          action: "PENGAJUAN_PINJAM",
          details: `Mengajukan peminjaman dengan keperluan: ${formData.get("purpose")}`
        }
      })

      // Notifikasi ke Admin
      if (admin) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: "Pengajuan Peminjaman Baru",
            message: `${session.user.name} mengajukan peminjaman BMN baru.`,
            link: `/dashboard/borrowings/${b.id}`
          }
        })
      }

      return b
    })

    return NextResponse.redirect(new URL("/dashboard/borrowings", request.headers.get("referer") || request.url), 303)
  } catch (error) {
    console.error("Failed to create borrowing:", error)
    return NextResponse.json({ error: "Failed to create borrowing" }, { status: 500 })
  }
}
