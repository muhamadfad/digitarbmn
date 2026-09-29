import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"

export default async function CreateBorrowingPage({
  searchParams,
}: {
  searchParams?: Promise<{ assetId?: string }>
}) {
  const resolvedParams = searchParams ? await searchParams : {}
  const preselectedAssetId = resolvedParams.assetId || ""

  const assets = await prisma.asset.findMany({
    where: { status: "TERSEDIA" },
    include: { category: true }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/borrowings" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ajukan Peminjaman BMN</h1>
          <p className="text-muted-foreground">Formulir pengajuan peminjaman aset Barang Milik Negara</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-md p-6">
        <form className="space-y-6" action="/api/borrowings/create" method="POST">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Aset BMN yang Dipinjam</label>
              {preselectedAssetId ? (
                <>
                  <input type="hidden" name="assetId" value={preselectedAssetId} />
                  <div className="w-full rounded-md border border-input bg-slate-100 px-3 py-2 text-sm text-slate-700 font-medium">
                    {assets.find(a => a.id === preselectedAssetId)?.name} ({assets.find(a => a.id === preselectedAssetId)?.nup})
                  </div>
                </>
              ) : (
                <>
                  <select name="assetId" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">-- Pilih Aset yang Tersedia --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.nup}) - {a.category?.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">Hanya aset dengan status 'Tersedia' yang muncul di daftar ini.</p>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tanggal Peminjaman</label>
                <input type="date" name="borrowDate" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rencana Tanggal Pengembalian</label>
                <input type="date" name="returnDate" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tujuan / Keperluan Peminjaman</label>
              <textarea name="purpose" rows={4} required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground" placeholder="Jelaskan secara singkat keperluan penggunaan aset ini..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard/borrowings" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              <Send className="w-4 h-4" /> Ajukan Peminjaman
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
