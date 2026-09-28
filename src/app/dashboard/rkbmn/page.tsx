import prisma from "@/lib/prisma"
import { FileText, Plus, AlertCircle, TrendingDown, Clock } from "lucide-react"
import Link from "next/link"

export default async function RkbmnPage() {
  const currentYear = new Date().getFullYear()
  const targetYear = currentYear + 1

  // Ambil data draft RKBMN dari database
  const rkbmnList = await prisma.rkbmn.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { items: true }
      }
    }
  })

  // Statistik Dummy/Otomatis untuk referensi
  const rusakBeratAssetsCount = await prisma.asset.count({ where: { condition: 'RUSAK_BERAT' } })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-sm shadow-sm border border-gray-300 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rencana Kebutuhan BMN (RKBMN)</h1>
          <p className="text-sm text-slate-600 mt-1">Manajemen Usulan Pengadaan, Pemeliharaan, dan Penghapusan BMN Tahun {targetYear}</p>
        </div>
        <Link href="/dashboard/rkbmn/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-sm text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Buat Draft RKBMN
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-sm shadow-sm border border-gray-300 p-6 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-800">Potensi Penghapusan</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Aset dengan kondisi Rusak Berat yang menunggu untuk dimasukkan ke draft RKBMN.</p>
          <div className="text-3xl font-bold tracking-tight">{rusakBeratAssetsCount} <span className="text-base font-normal text-slate-500">Aset</span></div>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-300 p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800">Draft RKBMN Tersimpan</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">Jumlah dokumen usulan RKBMN yang sedang dalam proses penggodokan.</p>
          <div className="text-3xl font-bold tracking-tight">{rkbmnList.length} <span className="text-base font-normal text-slate-500">Dokumen</span></div>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-gray-300 p-0 overflow-hidden">
        <div className="p-4 border-b-2 border-gray-300 bg-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Daftar Dokumen RKBMN</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="border-b-2 border-gray-300 bg-slate-50 text-slate-800 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Tanggal Dibuat</th>
                <th className="px-6 py-3">Jenis Usulan</th>
                <th className="px-6 py-3">Tahun</th>
                <th className="px-6 py-3">Total Item</th>
                <th className="px-6 py-3 text-right">Estimasi Biaya / Nilai</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b">
              {rkbmnList.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{doc.createdAt.toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800">{doc.type.replace('_', ' ')}</span>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]" title={doc.justification}>{doc.justification}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{doc.targetYear}</td>
                  <td className="px-6 py-4">{doc._count.items} Aset</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {doc.totalEstCost ? `Rp ${doc.totalEstCost.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-sm bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-500/20">
                      <Clock className="w-3 h-3 mr-1" /> {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
              {rkbmnList.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    Belum ada draft usulan RKBMN yang dibuat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
