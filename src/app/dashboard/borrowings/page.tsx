import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Search, Plus, Calendar, User, X, ChevronRight, List, ArrowUpDown } from "lucide-react"
import BorrowingActionButtons from "@/components/dashboard/BorrowingActionButtons"

export default async function BorrowingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; detailId?: string }>
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user
  
  const resolvedParams = await searchParams
  const detailId = resolvedParams.detailId
  const q = resolvedParams.q
  const status = resolvedParams.status

  const whereClause: any = {}

  if (user?.role === 'PENGGUNA_BMN' || user?.role === 'PENANGGUNG_JAWAB_RUANGAN') {
    whereClause.OR = [
      { userId: user.id }, 
      { asset: { userId: user.id } } 
    ]
  }
  
  if (q) {
    whereClause.AND = [
      {
        OR: [
          { purpose: { contains: q } },
          { asset: { name: { contains: q } } },
          { user: { name: { contains: q } } }
        ]
      }
    ]
  }
  
  if (status) {
    whereClause.status = status
  }

  const borrowings = await prisma.borrowing.findMany({
    where: whereClause,
    include: {
      asset: { include: { category: true } },
      user: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const activeFiltersCount = (status ? 1 : 0) + (q ? 1 : 0)

  // Fetch detail if any
  let detailBorrowing: any = null
  if (detailId) {
    detailBorrowing = await prisma.borrowing.findUnique({
      where: { id: detailId },
      include: {
        asset: { include: { category: true, room: true } },
        user: true,
      }
    })
  }

  const buildUrl = (overrideDetailId?: string | null) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    
    const finalDetailId = overrideDetailId !== undefined ? overrideDetailId : detailId
    if (finalDetailId) params.set('detailId', finalDetailId)

    return `/dashboard/borrowings?${params.toString()}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-start">
      {/* Kolom Tabel Utama */}
      <div className={`flex-1 flex flex-col bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 w-full ${detailBorrowing ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header Halaman */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Peminjaman BMN</h1>
            <p className="text-sm text-slate-500">Kelola pengajuan, persetujuan, dan pengembalian aset</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center rounded-md bg-[#107c41] border border-[#107c41] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0c5c30] transition-colors shadow-md">
               Ekspor Excel
            </button>
            <button className="flex items-center justify-center rounded-md bg-rose-600 border border-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 transition-colors shadow-md uppercase tracking-wide">
               Ekspor PDF
            </button>
            <Link href="/dashboard/borrowings/create" className="flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 shadow-md transition-colors w-full sm:w-auto">
              <Plus className="mr-1.5 h-4 w-4" /> Ajukan Peminjaman
            </Link>
          </div>
        </div>

        {/* Toolbar Tabel (Gaya Seragam dengan Data BMN) */}
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
                    <option value="">Status Peminjaman</option>
                    <option value="MENUNGGU_PERSETUJUAN">Menunggu</option>
                    <option value="DISETUJUI">Disetujui</option>
                    <option value="DITOLAK">Ditolak</option>
                    <option value="DIPINJAM">Dipinjam</option>
                    <option value="DIKEMBALIKAN">Dikembalikan</option>
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
                placeholder="Cari peminjam, nama aset..." 
                className="w-full rounded-l-sm border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium rounded-r-sm border border-primary transition-colors flex items-center">
                 <Search className="w-4 h-4 mr-2" /> Cari
              </button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-white text-slate-600 font-medium text-xs">
              <tr>
                <th className="px-4 py-2.5">Aset BMN</th>
                <th className="px-4 py-2.5">Peminjam</th>
                <th className="px-4 py-2.5">Tanggal Pinjam</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {borrowings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data peminjaman
                  </td>
                </tr>
              ) : (
                borrowings.map((borrowing) => (
                  <tr key={borrowing.id} className={`hover:bg-slate-50/80 transition-colors ${detailId === borrowing.id ? 'bg-primary/5/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 uppercase text-xs">{borrowing.asset.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono">{borrowing.asset.nup}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center text-slate-700">
                        <User className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> {borrowing.user.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center text-slate-700">
                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> 
                        {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        borrowing.status === 'MENUNGGU_PERSETUJUAN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        borrowing.status === 'DISETUJUI' ? 'bg-primary/5 text-primary border-blue-200' :
                        borrowing.status === 'DIPINJAM' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        borrowing.status === 'DIKEMBALIKAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {borrowing.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <BorrowingActionButtons 
                          borrowingId={borrowing.id} 
                          status={borrowing.status} 
                          userRole={user?.role || ''} 
                        />
                        <Link href={buildUrl(borrowing.id)} className="text-primary hover:text-primary/90 text-xs font-semibold">
                          Detail
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Layar ke-3: Detail Peminjaman */}
      {detailBorrowing && (
        <div className="w-full lg:w-[380px] bg-white rounded-md shadow-lg border border-slate-200/80 flex flex-col shrink-0 sticky top-0 animate-detail-pane">
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10 sticky top-0">
             <h3 className="font-bold text-slate-800 text-[13px] tracking-widest uppercase opacity-90">Detail Peminjaman</h3>
             <Link href={buildUrl(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
               <X className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="p-6 flex-1">
            <div className="inline-block px-2 py-1 bg-slate-100/80 text-slate-600 rounded-md font-mono text-[11px] font-bold tracking-wide mb-3 border border-slate-200/50">
              Peminjam: {detailBorrowing.user.name}
            </div>
            
            <h2 className="font-black text-slate-900 uppercase text-xl leading-tight mb-6">{detailBorrowing.asset.name}</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Keperluan</span>
                 <span className="text-sm font-semibold text-slate-700">{detailBorrowing.purpose}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tgl Pinjam</span>
                   <span className="text-sm font-bold text-slate-700">{new Date(detailBorrowing.borrowDate).toLocaleDateString('id-ID')}</span>
                </div>
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tgl Kembali</span>
                   <span className="text-sm font-bold text-slate-700">{new Date(detailBorrowing.estReturnDate).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Status Peminjaman</span>
                 <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border shadow-md ${
                    detailBorrowing.status === 'MENUNGGU_PERSETUJUAN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    detailBorrowing.status === 'DISETUJUI' ? 'bg-primary/5 text-primary border-blue-200' :
                    detailBorrowing.status === 'DIPINJAM' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    detailBorrowing.status === 'DIKEMBALIKAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {detailBorrowing.status.replace('_', ' ')}
                  </span>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 pt-2 pb-2">
              <Link href={`/dashboard/borrowings/${detailBorrowing.id}`} className="flex-1 bg-white text-slate-700 border border-slate-300 text-center py-2.5 text-xs font-bold rounded-md hover:bg-slate-50 transition-colors shadow-md flex items-center justify-center group">
                LIHAT PENUH <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
