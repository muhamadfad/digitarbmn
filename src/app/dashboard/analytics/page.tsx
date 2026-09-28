import prisma from "@/lib/prisma"
import { BarChart, PieChart, Activity, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default async function AnalyticsPage() {
  const totalAssets = await prisma.asset.count()
  
  // Calculate total value
  const assetsWithValue = await prisma.asset.findMany({
    select: { acquisitionValue: true }
  })
  const totalValue = assetsWithValue.reduce((acc, curr) => acc + (curr.acquisitionValue || 0), 0)

  // Get conditions
  const good = await prisma.asset.count({ where: { condition: 'BAIK' } })
  const light = await prisma.asset.count({ where: { condition: 'RUSAK_RINGAN' } })
  const heavy = await prisma.asset.count({ where: { condition: 'RUSAK_BERAT' } })

  // Get categories
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { assets: true }
      }
    }
  })

  // Get latest maintenances
  const latestMaintenances = await prisma.maintenance.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { asset: true }
  })

  // Rekomendasi Maintenance (Rusak Ringan)
  const needsMaintenance = await prisma.asset.findMany({
    where: { condition: 'RUSAK_RINGAN' },
    take: 10,
    include: { location: true, room: true },
    orderBy: { updatedAt: 'desc' }
  })

  // Rekomendasi Lelang / Penghapusan (Rusak Berat)
  const needsAuction = await prisma.asset.findMany({
    where: { condition: 'RUSAK_BERAT' },
    take: 10,
    include: { location: true, room: true },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white rounded-none sm:rounded-sm shadow-sm border border-slate-200 p-4 sm:p-5">
        <h1 className="text-lg font-bold text-slate-800">Analisis Data BMN</h1>
        <p className="text-sm text-slate-500">Insight dan laporan analitik komprehensif seluruh aset</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Nilai Perolehan</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">Rp {(totalValue / 1000000).toFixed(1)} Juta</p>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Kondisi Aset Baik</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{totalAssets > 0 ? Math.round((good / totalAssets) * 100) : 0}%</p>
          </div>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-sm">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Depresiasi / Rusak Berat</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{totalAssets > 0 ? Math.round((heavy / totalAssets) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribusi Kategori */}
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
            <PieChart className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-700 uppercase text-xs">Distribusi per Kategori</h3>
          </div>
          <div className="p-5 flex-1 bg-white">
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={cat.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">{cat.name} ({cat._count.assets})</span>
                    <span className="text-slate-500 font-mono">{totalAssets > 0 ? Math.round((cat._count.assets / totalAssets) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-sm h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-sm" style={{ width: `${totalAssets > 0 ? (cat._count.assets / totalAssets) * 100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-slate-500 text-xs">Tidak ada kategori data.</p>}
            </div>
          </div>
        </div>

        {/* Aktivitas Maintenance Terbaru */}
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center gap-2 bg-slate-50">
            <Activity className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-700 uppercase text-xs">Log Maintenance Terakhir</h3>
          </div>
          <div className="flex-1 overflow-x-auto bg-white">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 text-slate-600 font-medium text-xs">
                <tr>
                  <th className="px-4 py-2.5">Aset</th>
                  <th className="px-4 py-2.5 text-center">Jenis</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestMaintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 uppercase text-xs">{m.asset.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{new Date(m.date).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border ${
                        m.type === 'PREVENTIF' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border ${
                        m.status === 'SELESAI' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        m.status === 'PROSES' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {latestMaintenances.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-xs text-slate-500">Belum ada riwayat maintenance.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Butuh Maintenance */}
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Perlu Maintenance (Rusak Ringan)</h3>
          </div>
          <div className="flex-1 overflow-x-auto bg-white">
            <table className="w-full text-left text-sm text-slate-700">
              <tbody className="divide-y divide-slate-100">
                {needsMaintenance.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 uppercase text-xs">{asset.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NUP: {asset.nup} &bull; {asset.room?.name || '-'}</div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-1">Rp {(asset.acquisitionValue || 0).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-amber-50 text-amber-700 border-amber-200">
                        {asset.condition.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {needsMaintenance.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-xs text-slate-500">Tidak ada aset yang perlu maintenance saat ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Butuh Lelang / Penghapusan */}
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Rekomendasi Lelang/Hapus (Rusak Berat)</h3>
          </div>
          <div className="flex-1 overflow-x-auto bg-white">
            <table className="w-full text-left text-sm text-slate-700">
              <tbody className="divide-y divide-slate-100">
                {needsAuction.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 uppercase text-xs">{asset.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NUP: {asset.nup} &bull; {asset.room?.name || '-'}</div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-1">Rp {(asset.acquisitionValue || 0).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border bg-rose-50 text-rose-700 border-rose-200">
                        {asset.condition.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {needsAuction.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-xs text-slate-500">Tidak ada aset rusak berat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
