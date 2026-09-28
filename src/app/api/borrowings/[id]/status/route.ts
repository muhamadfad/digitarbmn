import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_BMN' && session.user.role !== 'PIMPINAN')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const action = formData.get("action") as string // APPROVE, REJECT, COMPLETE

    const resolvedParams = await params
    const borrowingId = resolvedParams.id
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: { asset: true, user: true }
    })

    if (!borrowing) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    if (action === 'APPROVE') {
      // Setujui pinjaman
      await prisma.$transaction(async (tx) => {
        await tx.borrowing.update({
          where: { id: borrowingId },
          data: { status: 'DISETUJUI' }
        })
        // Ubah status aset jadi dipinjam
        await tx.asset.update({
          where: { id: borrowing.assetId },
          data: { status: 'DIPINJAM' }
        })
        // Audit log (bisa dilakukan nanti kalau helper audit sudah dibuat, untuk sementara kita insert manual)
        await tx.auditLog.create({
          data: {
            assetId: borrowing.assetId,
            userId: session.user.id,
            action: "DIPINJAM",
            details: `Disetujui peminjaman oleh ${borrowing.user.name}`
          }
        })
        // Notifikasi ke peminjam
        await tx.notification.create({
          data: {
            userId: borrowing.userId,
            title: "Peminjaman Disetujui",
            message: `Pengajuan peminjaman aset ${borrowing.asset.name} telah disetujui.`,
            link: `/dashboard/borrowings/${borrowing.id}`
          }
        })
      })
    } else if (action === 'REJECT') {
      await prisma.$transaction(async (tx) => {
        await tx.borrowing.update({
          where: { id: borrowingId },
          data: { status: 'DITOLAK' }
        })
        // Notifikasi ke peminjam
        await tx.notification.create({
          data: {
            userId: borrowing.userId,
            title: "Peminjaman Ditolak",
            message: `Pengajuan peminjaman aset ${borrowing.asset.name} ditolak oleh pengelola.`,
            link: `/dashboard/borrowings/${borrowing.id}`
          }
        })
      })
    } else if (action === 'COMPLETE') {
      // Barang dikembalikan
      await prisma.$transaction(async (tx) => {
        await tx.borrowing.update({
          where: { id: borrowingId },
          data: { 
            status: 'SELESAI'
          }
        })
        // Kembalikan status aset jadi tersedia
        await tx.asset.update({
          where: { id: borrowing.assetId },
          data: { status: 'TERSEDIA' }
        })
        // Audit log
        await tx.auditLog.create({
          data: {
            assetId: borrowing.assetId,
            userId: session.user.id,
            action: "DIKEMBALIKAN",
            details: `Dikembalikan oleh ${borrowing.user.name} dan status menjadi TERSEDIA`
          }
        })
      })
    }

    return NextResponse.redirect(new URL(`/dashboard/borrowings/${borrowingId}`, req.headers.get("referer") || req.url))
  } catch (error) {
    console.error("Borrowing action error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
