import Link from "next/link"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function CreateRkbmnPage() {
  const targetYear = new Date().getFullYear() + 1
  
  // Ambil data aset rusak berat
  const rusakBeratAssets = await prisma.asset.findMany({
    where: { condition: 'RUSAK_BERAT' },
    include: { room: true }
  })

  const totalEstValue = rusakBeratAssets.reduce((acc, curr) => acc + (curr.acquisitionValue || 0), 0)

  async function createRkbmn(formData: FormData) {
    "use server"
    
    const type = formData.get('type') as string
    const justification = formData.get('justification') as string
    
    // Create RKBMN entry
    const rkbmn = await prisma.rkbmn.create({
      data: {
        targetYear: new Date().getFullYear() + 1,
        type,
        justification,
        totalEstCost: totalEstValue,
      }
    })

    // If it's Penghapusan, automatically link all RUSAK_BERAT assets
    if (type === 'PENGHAPUSAN') {
      const assets = await prisma.asset.findMany({ where: { condition: 'RUSAK_BERAT' }})
      if (assets.length > 0) {
        await prisma.rkbmnItem.createMany({
          data: assets.map(a => ({
            rkbmnId: rkbmn.id,
            assetId: a.id,
            quantity: 1,
            estPrice: a.acquisitionValue
          }))
        })
      }
    }

    redirect('/dashboard/rkbmn')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rkbmn" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pembuatan Draft RKBMN Baru</h1>
          <p className="text-muted-foreground">Form usulan Rencana Kebutuhan BMN Tahun Anggaran {targetYear}</p>
        </div>
      </div>

      <div className="bg-card border rounded-sm shadow-sm p-6">
        <form className="space-y-6" action={createRkbmn}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tahun Anggaran</label>
              <input type="text" value={targetYear} disabled className="w-full rounded-sm border border-input bg-slate-100 px-3 py-2 text-sm shadow-sm opacity-70 cursor-not-allowed" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Jenis Usulan RKBMN</label>
              <select name="type" required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="PENGHAPUSAN">Usulan Penghapusan (Otomatis dari Kondisi Rusak Berat)</option>
                <option value="PENGADAAN">Usulan Pengadaan Aset Baru</option>
                <option value="PEMELIHARAAN">Usulan Anggaran Pemeliharaan</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Keterangan Tambahan / Justifikasi</label>
            <textarea name="justification" rows={4} required className="w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground" placeholder="Tuliskan justifikasi singkat mengenai urgensi usulan ini..." />
          </div>
          
          <div className="p-4 bg-amber-50 text-amber-800 rounded-sm border border-amber-200 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong>Perhatian:</strong> Karena Anda memilih "Usulan Penghapusan", sistem otomatis melampirkan <strong>{rusakBeratAssets.length} aset</strong> dengan kondisi "Rusak Berat". Silakan verifikasi daftar di bawah ini sebelum menyimpan.
            </div>
          </div>

          {/* Tabel Daftar Aset yang Akan Dihapuskan */}
          <div className="border border-gray-300 rounded-sm overflow-hidden">
            <div className="bg-slate-100 border-b border-gray-300 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-800">
              Lampiran Aset (Otomatis)
            </div>
            <div className="max-h-60 overflow-y-auto scrollbar-hide">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-white border-b sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-semibold">NUP / Nama BMN</th>
                    <th className="px-4 py-2 font-semibold">Lokasi</th>
                    <th className="px-4 py-2 font-semibold text-right">Nilai Perolehan</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {rusakBeratAssets.map(asset => (
                    <tr key={asset.id}>
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-900">{asset.name}</div>
                        <div className="text-xs text-gray-500">NUP: {asset.nup}</div>
                      </td>
                      <td className="px-4 py-2 text-xs">{asset.room?.name || '-'}</td>
                      <td className="px-4 py-2 text-right text-xs font-semibold">
                        Rp {(asset.acquisitionValue || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  {rusakBeratAssets.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500 text-sm">Tidak ada aset rusak berat.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t font-semibold">
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-right">Total Nilai Estimasi Penghapusan:</td>
                    <td className="px-4 py-2 text-right text-rose-600">
                      Rp {totalEstValue.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard/rkbmn" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary/90 shadow-sm">
              <Save className="w-4 h-4" /> Simpan & Generate Lampiran
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
