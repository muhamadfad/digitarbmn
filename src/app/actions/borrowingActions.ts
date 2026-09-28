"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function approveBorrowing(borrowingId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_BMN')) {
    throw new Error("Unauthorized")
  }

  const borrowing = await prisma.borrowing.findUnique({ where: { id: borrowingId } })
  if (!borrowing || borrowing.status !== 'MENUNGGU_PERSETUJUAN') {
    throw new Error("Invalid borrowing state")
  }

  // Update status peminjaman menjadi DISETUJUI
  await prisma.borrowing.update({
    where: { id: borrowingId },
    data: { status: 'DISETUJUI' }
  })

  // Tambahkan audit log
  await prisma.assetHistory.create({
    data: {
      assetId: borrowing.assetId,
      eventType: 'BORROW_APPROVED',
      title: 'Peminjaman Disetujui',
      description: `Peminjaman oleh user disetujui`,
      actorId: session.user.id,
      referenceType: 'BORROWING',
      referenceId: borrowingId
    }
  })

  revalidatePath('/dashboard/borrowings')
  revalidatePath('/dashboard')
}

export async function rejectBorrowing(borrowingId: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_BMN')) {
    throw new Error("Unauthorized")
  }

  const borrowing = await prisma.borrowing.findUnique({ where: { id: borrowingId } })
  if (!borrowing || borrowing.status !== 'MENUNGGU_PERSETUJUAN') {
    throw new Error("Invalid borrowing state")
  }

  // Update status peminjaman menjadi DITOLAK
  await prisma.borrowing.update({
    where: { id: borrowingId },
    data: { status: 'DITOLAK' }
  })

  // Tambahkan audit log
  await prisma.assetHistory.create({
    data: {
      assetId: borrowing.assetId,
      eventType: 'BORROW_REJECTED',
      title: 'Peminjaman Ditolak',
      description: `Peminjaman oleh user ditolak`,
      actorId: session.user.id,
      referenceType: 'BORROWING',
      referenceId: borrowingId
    }
  })

  revalidatePath('/dashboard/borrowings')
  revalidatePath('/dashboard')
}
