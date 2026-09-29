import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ClipboardCheck, Plus, Search, CheckCircle, XCircle, X, ChevronRight, List, ArrowUpDown } from "lucide-react"

export default async function SensusPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; detailId?: string }>
}) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'PENGELOLA_BMN'
  
  const resolvedParams = await searchParams
  const detailId = resolvedParams.detailId
  const q = resolvedParams.q
  const status = resolvedParams.status

  const whereClause: any = {}
  if (q) {
    whereClause.period = { contains: q }
  }
  if (status) {
    whereClause.status = status
  }

  const sensusList = await prisma.sensus.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { records: true } }
    }
  })

  // Ambil total aset aktif untuk mengukur progress sensus
  const totalAssets = await prisma.asset.count({
    where: { status: { not: 'TIDAK_TERSEDIA' } }
  })
  
  const activeFiltersCount = (status ? 1 : 0) + (q ? 1 : 0)

  // Fetch detail if any
  let detailSensus: any = null
  if (detailId) {
    detailSensus = await prisma.sensus.findUnique({
      where: { id: detailId },
      include: {
        _count: { select: { records: true } }
      }
    })
  }

  const buildUrl = (overrideDetailId?: string | null) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    
    const finalDetailId = overrideDetailId !== undefined ? overrideDetailId : detailId
    if (finalDetailId) params.set('detailId', finalDetailId)

    return `/dashboard/sensus?${params.toString()}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-start">
      {/* Kolom Tabel Utama */}
      <div className={`flex-1 flex flex-col bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 w-full ${detailSensus ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header Halaman */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              Sensus BMN (Stock Opname)
            </h1>
            <p className="text-sm text-slate-500">Lakukan pengecekan fisik dan inventarisasi aset secara massal</p>
          </div>
          
          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button className="flex items-center justify-center rounded-md bg-[#107c41] border border-[#107c41] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0c5c30] transition-colors shadow-md">
                 Ekspor Excel
              </button>
              <button className="flex items-center justify-center rounded-md bg-rose-600 border border-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 transition-colors shadow-md uppercase tracking-wide">
                 Ekspor PDF
              </button>
              <Link href="/dashboard/sensus/create" className="flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 shadow-md transition-colors">
                <Plus className="mr-1.5 h-4 w-4" /> Buka Sensus
              </Link>
            </div>
          )}
        </div>

        {/* Toolbar Tabel */}
        <form method="GET" className="p-4 bg-white flex flex-col gap-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              
              <div className="relative border border-slate-300 bg-white rounded-md hover:bg-slate-50 shadow-md flex items-center">
                 <List className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                 <select 
                   name="status" 
                   defaultValue={status || ""}
                   className="appearance-none bg-transparent pl-9 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none w-40 sm:w-48 cursor-pointer"
                 >
                    <option value="">Status Sensus</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="DITUTUP">Ditutup</option>
                 </select>
                 <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
              
              {activeFiltersCount > 0 && (
                <div className="flex items-center px-2 py-1 bg-amber-500 text-white rounded-md shadow-md">
                  <span className="text-xs font-bold mr-1.5 bg-amber-600 px-1.5 rounded">{activeFiltersCount}</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Data Tersaring</span>
                </div>
              )}
              
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 flex">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                name="q"
                defaultValue={q || ""}
                placeholder="Cari nama periode sensus..." 
                className="w-full rounded-l-sm border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium rounded-r-sm border border-indigo-600 transition-colors flex items-center">
                 <Search className="w-4 h-4 mr-2" /> Cari
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-white text-slate-600 font-medium text-xs">
              <tr>
                <th className="px-4 py-2.5">Judul Sensus</th>
                <th className="px-4 py-2.5">Tanggal</th>
                <th className="px-4 py-2.5 text-center">Progress Scan</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sensusList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data Stock Opname.
                  </td>
                </tr>
              ) : (
                sensusList.map((sensus) => {
                  const progress = totalAssets > 0 ? Math.round((sensus._count.records / totalAssets) * 100) : 0;
                  return (
                    <tr key={sensus.id} className={`hover:bg-slate-50/80 transition-colors ${detailId === sensus.id ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-xs">Sensus {sensus.period} {sensus.year}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-[200px]">{sensus.notes || '-'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {new Date(sensus.startDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{sensus._count.records} / {totalAssets}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                          sensus.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {sensus.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={buildUrl(sensus.id)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Layar ke-3: Detail Sensus */}
      {detailSensus && (
        <div className="w-full lg:w-[380px] bg-white rounded-md shadow-lg border border-slate-200/80 flex flex-col shrink-0 sticky top-0 animate-detail-pane">
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10 sticky top-0">
             <h3 className="font-bold text-slate-800 text-[13px] tracking-widest uppercase opacity-90">Detail Sensus</h3>
             <Link href={buildUrl(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
               <X className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="p-6 flex-1">
            <div className="inline-block px-2 py-1 bg-slate-100/80 text-slate-600 rounded-md font-mono text-[11px] font-bold tracking-wide mb-3 border border-slate-200/50">
              Mulai: {new Date(detailSensus.startDate).toLocaleDateString('id-ID')}
            </div>
            
            <h2 className="font-black text-slate-900 uppercase text-xl leading-tight mb-6">Sensus {detailSensus.period} {detailSensus.year}</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Catatan Tambahan</span>
                 <span className="text-sm font-semibold text-slate-700">{detailSensus.notes || '-'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Total Ditemukan</span>
                   <span className="text-xl font-black text-indigo-600">{detailSensus._count.records}</span>
                </div>
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Status</span>
                   <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border shadow-md ${
                      detailSensus.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {detailSensus.status}
                    </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 pt-2 pb-2">
              <Link href={`/dashboard/sensus/${detailSensus.id}`} className="flex-1 bg-white text-slate-700 border border-slate-300 text-center py-2.5 text-xs font-bold rounded-md hover:bg-slate-50 transition-colors shadow-md flex items-center justify-center group">
                LANJUTKAN SCAN <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
