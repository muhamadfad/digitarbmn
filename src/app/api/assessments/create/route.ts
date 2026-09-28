import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const assetId = formData.get("assetId") as string
    const condition = formData.get("condition") as string
    
    const rvStr = formData.get("residualValue") as string
    const residualValue = rvStr ? parseInt(rvStr) : null

    // Cari admin untuk diberi notifikasi (jika barang rusak)
    const admin = await prisma.user.findFirst({
      where: { role: { name: 'ADMIN' } }
    })

    await prisma.$transaction(async (tx) => {
      const assessment = await tx.assessment.create({
        data: {
          assetId: assetId,
          assessorId: session.user.id,
          physicalCond: condition,
          functionality: condition === "BAIK" ? "BERFUNGSI_BAIK" : "KURANG_BERFUNGSI",
          feasibility: condition === "BAIK" ? "LAYAK" : "PERLU_PERBAIKAN",
          damageLevel: condition === "BAIK" ? "NONE" : (condition === "RUSAK_BERAT" ? "SEVERE" : "MODERATE"),
          estCost: residualValue,
          result: condition,
          notes: formData.get("notes") as string,
        }
      })

      // Update the actual asset condition
      await tx.asset.update({
        where: { id: assetId },
        data: { condition: condition }
      })

      // Log the history ke Audit Log
      await tx.auditLog.create({
        data: {
          assetId: assetId,
          userId: session.user.id,
          action: "UBAH_KONDISI",
          details: `Lapor Cek Fisik (Assessment): Kondisi dinilai ${condition}. ${assessment.notes ? `Catatan: ${assessment.notes}` : ''}`,
        }
      })

      // Jika kondisi rusak, beri notifikasi ke Admin
      if (admin && condition !== 'BAIK') {
        const asset = await tx.asset.findUnique({ where: { id: assetId }})
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: "Laporan Kerusakan BMN",
            message: `${session.user.name} melaporkan bahwa ${asset?.name} dalam kondisi ${condition.replace('_', ' ')}.`,
            link: `/dashboard/assets/${assetId}` // Arahkan admin untuk melihat detail aset
          }
        })
      }
    })

    return NextResponse.redirect(new URL("/dashboard/assessments", request.headers.get("referer") || request.url), 303)
  } catch (error) {
    console.error("Failed to create assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
