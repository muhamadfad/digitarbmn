import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function CreateAssessmentPage({
  searchParams,
}: {
  searchParams?: Promise<{ assetId?: string }>
}) {
  const resolvedParams = searchParams ? await searchParams : {}
  const preselectedAssetId = resolvedParams.assetId || ""

  const assets = await prisma.asset.findMany({
    include: { category: true }
  })
  
  const session = await getServerSession(authOptions)
  const isAdminOrPengelola = session?.user?.role === 'ADMIN' || session?.user?.role === 'PENGELOLA_BMN'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/assessments" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Assessment Kondisi BMN</h1>
          <p className="text-muted-foreground">Lakukan penilaian berkala terhadap fisik dan nilai aset</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-md p-6">
        <form className="space-y-6" action="/api/assessments/create" method="POST">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Aset BMN yang Dinilai</label>
              {preselectedAssetId ? (
                <>
                  <input type="hidden" name="assetId" value={preselectedAssetId} />
                  <div className="w-full rounded-md border border-input bg-slate-100 px-3 py-2 text-sm text-slate-700 font-medium">
                    {assets.find(a => a.id === preselectedAssetId)?.name} ({assets.find(a => a.id === preselectedAssetId)?.nup})
                  </div>
                </>
              ) : (
                <select name="assetId" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">-- Pilih Aset --</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.nup})</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Kondisi Saat Ini</label>
                <select name="condition" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="BAIK">Baik</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan</option>
                  <option value="RUSAK_BERAT">Rusak Berat</option>
                </select>
              </div>
                {isAdminOrPengelola && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Estimasi Biaya Perbaikan (Rp)</label>
                    <input type="number" name="residualValue" placeholder="Misal: 500000" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    <p className="text-xs text-muted-foreground">Opsional. Kosongkan jika barang dalam kondisi Baik.</p>
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Catatan Assessment</label>
              <textarea name="notes" rows={4} required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground" placeholder="Detail penilaian fisik, alasan kerusakan, atau rincian penyusutan..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard/assessments" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              <Save className="w-4 h-4" /> Simpan Hasil Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
