import prisma from "@/lib/prisma"
import Link from "next/link"
import { Search, Plus, AlertTriangle, X, ChevronRight, List, ArrowUpDown } from "lucide-react"

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; detailId?: string }>
}) {
  const resolvedParams = await searchParams
  const detailId = resolvedParams.detailId
  const q = resolvedParams.q
  const status = resolvedParams.status

  const whereClause: any = {}
  
  if (q) {
    whereClause.OR = [
      { asset: { name: { contains: q } } },
      { asset: { nup: { contains: q } } },
      { damageType: { contains: q } }
    ]
  }
  
  if (status) {
    whereClause.status = status
  }

  const complaints = await prisma.complaint.findMany({
    where: whereClause,
    include: {
      asset: { include: { category: true } },
      reporter: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const activeFiltersCount = (status ? 1 : 0) + (q ? 1 : 0)

  // Fetch detail if any
  let detailComplaint: any = null
  if (detailId) {
    detailComplaint = await prisma.complaint.findUnique({
      where: { id: detailId },
      include: {
        asset: { include: { category: true, room: { include: { location: true } } } },
        reporter: true,
      }
    })
  }

  const buildUrl = (overrideDetailId?: string | null) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    
    const finalDetailId = overrideDetailId !== undefined ? overrideDetailId : detailId
    if (finalDetailId) params.set('detailId', finalDetailId)

    return `/dashboard/complaints?${params.toString()}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-start">
      {/* Kolom Tabel Utama */}
      <div className={`flex-1 flex flex-col bg-white rounded-none sm:rounded-sm shadow-sm border border-slate-200 w-full ${detailComplaint ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header Halaman */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Pengaduan Kerusakan</h1>
            <p className="text-sm text-slate-500">Laporan kerusakan aset dari pengguna ruang</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center rounded-sm bg-[#107c41] border border-[#107c41] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0c5c30] transition-colors shadow-sm">
               Ekspor Excel
            </button>
            <button className="flex items-center justify-center rounded-sm bg-rose-600 border border-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 transition-colors shadow-sm uppercase tracking-wide">
               Ekspor PDF
            </button>
            <Link href="/dashboard/complaints/create" className="flex items-center justify-center rounded-sm bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors w-full sm:w-auto">
              <Plus className="mr-1.5 h-4 w-4" /> Buat Laporan
            </Link>
          </div>
        </div>

        {/* Toolbar Tabel */}
        <form method="GET" className="p-4 bg-white flex flex-col gap-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              
              <div className="relative border border-slate-300 bg-white rounded-sm hover:bg-slate-50 shadow-sm flex items-center">
                 <List className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                 <select 
                   name="status" 
                   defaultValue={status || ""}
                   className="appearance-none bg-transparent pl-9 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none w-48 sm:w-56 cursor-pointer"
                 >
                    <option value="">Semua Status</option>
                    <option value="OPEN">Menunggu Verifikasi</option>
                    <option value="VERIFIED">Terverifikasi</option>
                    <option value="IN_PROGRESS">Dalam Perbaikan</option>
                    <option value="RESOLVED">Selesai Diperbaiki</option>
                    <option value="REJECTED">Ditolak</option>
                 </select>
                 <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
              
              {activeFiltersCount > 0 && (
                <div className="flex items-center px-2 py-1 bg-amber-500 text-white rounded-sm shadow-sm">
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
                placeholder="Cari nama aset, jenis kerusakan..." 
                className="w-full rounded-l-sm border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-r-sm border border-blue-600 transition-colors flex items-center">
                 <Search className="w-4 h-4 mr-2" /> Cari
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-white text-slate-600 font-medium text-xs">
              <tr>
                <th className="px-4 py-2.5">Aset / NUP</th>
                <th className="px-4 py-2.5">Jenis Kerusakan</th>
                <th className="px-4 py-2.5">Pelapor</th>
                <th className="px-4 py-2.5 text-center">Prioritas</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center w-full">
                      <AlertTriangle className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-sm">Tidak ada data pengaduan kerusakan.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${detailId === c.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 uppercase text-xs">{c.asset.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{c.asset.nup}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <div className="font-medium text-rose-600 line-clamp-1 max-w-[150px]">{c.damageType}</div>
                      <div className="text-slate-500 mt-0.5">{new Date(c.incidentDate).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {c.reporter.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border ${
                        c.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        c.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        c.priority === 'MEDIUM' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sm border ${
                        c.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        c.status === 'VERIFIED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        c.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={buildUrl(c.id)} className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Layar ke-3: Detail Pengaduan */}
      {detailComplaint && (
        <div className="w-full lg:w-[380px] bg-white rounded-md shadow-lg border border-slate-200/80 flex flex-col shrink-0 sticky top-0 animate-detail-pane">
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10 sticky top-0">
             <h3 className="font-bold text-slate-800 text-[13px] tracking-widest uppercase opacity-90">Detail Pengaduan</h3>
             <Link href={buildUrl(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
               <X className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="p-6 flex-1">
            <div className="flex items-center gap-2 mb-4">
               <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase rounded-md border shadow-sm ${
                 detailComplaint.priority === 'CRITICAL' ? 'bg-rose-600 text-white border-rose-700' :
                 detailComplaint.priority === 'HIGH' ? 'bg-amber-500 text-white border-amber-600' :
                 'bg-slate-200 text-slate-700 border-slate-300'
               }`}>
                 PRIORITAS {detailComplaint.priority}
               </span>
               <span className={`inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold uppercase rounded-md border shadow-sm ${
                  detailComplaint.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  detailComplaint.status === 'VERIFIED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  detailComplaint.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  detailComplaint.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {detailComplaint.status.replace('_', ' ')}
                </span>
            </div>
            
            <h2 className="font-black text-rose-600 uppercase text-xl leading-tight mb-2">{detailComplaint.damageType}</h2>
            <div className="text-xs text-slate-500 font-semibold mb-6 flex items-center">
              Dilaporkan oleh: {detailComplaint.reporter.name}
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Informasi Aset</span>
                 <span className="text-sm font-bold text-slate-800 block mb-1">{detailComplaint.asset.name}</span>
                 <span className="text-xs font-mono text-slate-500 block">NUP: {detailComplaint.asset.nup}</span>
                 {detailComplaint.asset.room && (
                   <span className="text-xs text-slate-600 mt-2 block border-t border-slate-200 pt-2">
                     Lokasi: {detailComplaint.asset.room.name}
                   </span>
                 )}
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Deskripsi Kerusakan</span>
                 <p className="text-sm text-slate-700 whitespace-pre-wrap">{detailComplaint.description}</p>
                 <span className="block text-xs text-slate-400 mt-3 pt-3 border-t border-slate-200">
                   Waktu Kejadian: {new Date(detailComplaint.incidentDate).toLocaleString('id-ID')}
                 </span>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 pt-2 pb-2">
              <Link href={`/dashboard/complaints/${detailComplaint.id}`} className="flex-1 bg-white text-slate-700 border border-slate-300 text-center py-2.5 text-xs font-bold rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center group">
                KELOLA PENGADUAN <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
