import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Save, Copy } from "lucide-react"

export default async function CreateMaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const assets = await prisma.asset.findMany({
    include: { category: true }
  })
  
  const params = await searchParams
  const prefillAssetId = params.assetId as string || ""
  const prefillType = params.type as string || "PREVENTIF"
  const prefillTechnician = params.technician as string || ""
  const prefillCost = params.cost as string || ""
  const prefillDescription = params.description as string || ""

  // Default to today's date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/maintenances" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Catat Maintenance BMN</h1>
          <p className="text-muted-foreground">Formulir pencatatan pemeliharaan preventif / kuratif</p>
        </div>
      </div>

      {prefillTechnician && (
        <div className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-sm text-sm flex items-center gap-2">
          <Copy className="w-4 h-4" />
          Anda sedang menduplikasi data maintenance sebelumnya. Silakan sesuaikan tanggal dan rincian jika perlu.
        </div>
      )}

      <div className="bg-card border rounded-sm shadow-sm p-6">
        <form className="space-y-6" action="/api/maintenances/create" method="POST">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pilih Aset BMN</label>
              <select name="assetId" defaultValue={prefillAssetId} required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">-- Pilih Aset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.nup}) - {a.category?.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Jenis Pemeliharaan</label>
                <select name="type" defaultValue={prefillType} required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="PREVENTIF">Preventif (Rutin)</option>
                  <option value="KURATIF">Kuratif (Perbaikan)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tanggal Maintenance</label>
                <input type="date" name="date" defaultValue={today} required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Teknisi / Vendor</label>
                <input type="text" name="technician" defaultValue={prefillTechnician} placeholder="Nama petugas atau perusahaan vendor" required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Biaya (Rp)</label>
                <input type="number" name="cost" defaultValue={prefillCost} placeholder="0" className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deskripsi Tindakan</label>
              <textarea name="description" defaultValue={prefillDescription} rows={4} required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground" placeholder="Jelaskan secara rinci tindakan perbaikan atau pengecekan yang dilakukan..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard/maintenances" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90">
              <Save className="w-4 h-4" /> Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
