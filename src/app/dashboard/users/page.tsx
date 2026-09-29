import prisma from "@/lib/prisma"
import { Search, Plus, UserCheck, UserX, User as UserIcon, X, ChevronRight, List, ArrowUpDown } from "lucide-react"
import Link from "next/link"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; roleId?: string; detailId?: string }>
}) {
  const resolvedParams = await searchParams
  const detailId = resolvedParams.detailId
  const q = resolvedParams.q
  const roleId = resolvedParams.roleId

  const whereClause: any = {}
  
  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { username: { contains: q } },
      { email: { contains: q } }
    ]
  }
  
  if (roleId) {
    whereClause.roleId = roleId
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
      role: true,
      unit: true,
      heldAssets: true, 
    },
    orderBy: { name: 'asc' }
  })
  
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' }
  })
  
  const activeFiltersCount = (roleId ? 1 : 0) + (q ? 1 : 0)

  // Fetch detail if any
  let detailUser: any = null
  if (detailId) {
    detailUser = await prisma.user.findUnique({
      where: { id: detailId },
      include: {
        role: true,
        unit: true,
        heldAssets: { include: { category: true } },
      }
    })
  }

  const buildUrl = (overrideDetailId?: string | null) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (roleId) params.set('roleId', roleId)
    
    const finalDetailId = overrideDetailId !== undefined ? overrideDetailId : detailId
    if (finalDetailId) params.set('detailId', finalDetailId)

    return `/dashboard/users?${params.toString()}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-start">
      {/* Kolom Tabel Utama */}
      <div className={`flex-1 flex flex-col bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 w-full ${detailUser ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Header Halaman */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Data Pegawai & Pengguna</h1>
            <p className="text-sm text-slate-500">Kelola data pegawai, hak akses, dan role pengguna sistem.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center rounded-md bg-[#107c41] border border-[#107c41] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0c5c30] transition-colors shadow-md">
               Ekspor Excel
            </button>
            <button className="flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 shadow-md transition-colors w-full sm:w-auto">
              <Plus className="mr-1.5 h-4 w-4" /> Tambah Pegawai
            </button>
          </div>
        </div>

        {/* Toolbar Tabel */}
        <form method="GET" className="p-4 bg-white flex flex-col gap-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              
              <div className="relative border border-slate-300 bg-white rounded-md hover:bg-slate-50 shadow-md flex items-center">
                 <List className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                 <select 
                   name="roleId" 
                   defaultValue={roleId || ""}
                   className="appearance-none bg-transparent pl-9 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none w-48 sm:w-56 cursor-pointer"
                 >
                    <option value="">Semua Role Akses</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>
                    ))}
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
                placeholder="Cari nama, email, username..." 
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
                <th className="px-4 py-2.5">Nama Lengkap</th>
                <th className="px-4 py-2.5">Username / Email</th>
                <th className="px-4 py-2.5">Unit / Bagian</th>
                <th className="px-4 py-2.5 text-center">Role Akses</th>
                <th className="px-4 py-2.5 text-center">Jumlah BMN</th>
                <th className="px-4 py-2.5 text-center">Status</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data pegawai.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${detailId === u.id ? 'bg-primary/5/50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-100 p-1.5 rounded-md text-slate-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 text-xs font-semibold">{u.username}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {u.unit?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        u.role.name === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                        u.role.name === 'PENGGUNA_BMN' ? 'bg-primary/5 text-primary border-blue-200' :
                        u.role.name === 'PENANGGUNG_JAWAB_RUANGAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {u.role.name.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-xs text-primary">
                      {u.heldAssets.length} Aset
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.isActive ? (
                        <span className="inline-flex items-center justify-center gap-1 text-emerald-600 text-[11px] font-bold uppercase"><UserCheck className="w-3.5 h-3.5" /> Aktif</span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1 text-rose-600 text-[11px] font-bold uppercase"><UserX className="w-3.5 h-3.5" /> Nonaktif</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={buildUrl(u.id)} className="text-primary hover:text-primary/90 text-xs font-semibold">
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

      {/* Panel Layar ke-3: Detail Pengguna */}
      {detailUser && (
        <div className="w-full lg:w-[380px] bg-white rounded-md shadow-lg border border-slate-200/80 flex flex-col shrink-0 sticky top-0 animate-detail-pane">
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10 sticky top-0">
             <h3 className="font-bold text-slate-800 text-[13px] tracking-widest uppercase opacity-90">Profil Pegawai</h3>
             <Link href={buildUrl(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
               <X className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="p-6 flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-xl leading-tight">{detailUser.name}</h2>
                <span className="text-sm text-slate-500 font-mono">{detailUser.email}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Unit / Bagian</span>
                 <span className="text-sm font-semibold text-slate-700">{detailUser.unit?.name || 'Tidak Ada'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Role Akses</span>
                   <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border shadow-md ${
                      detailUser.role.name === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      detailUser.role.name === 'PENGGUNA_BMN' ? 'bg-primary/5 text-primary border-blue-200' :
                      detailUser.role.name === 'PENANGGUNG_JAWAB_RUANGAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {detailUser.role.name.replace(/_/g, ' ')}
                    </span>
                </div>
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Status Akun</span>
                   <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border shadow-md ${
                      detailUser.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {detailUser.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                </div>
              </div>

              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Aset yang Dipegang ({detailUser.heldAssets.length})</span>
                 {detailUser.heldAssets.length === 0 ? (
                   <span className="text-sm text-slate-500 italic">Tidak ada BMN yang dipegang</span>
                 ) : (
                   <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                     {detailUser.heldAssets.map((asset: any) => (
                       <div key={asset.id} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded text-xs">
                         <div className="truncate flex-1 font-semibold text-slate-700 mr-2">{asset.name}</div>
                         <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shrink-0">{asset.nup}</div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 pt-2 pb-2">
              <Link href={`/dashboard/users/${detailUser.id}/edit`} className="flex-1 bg-primary text-white text-center py-2.5 text-xs font-bold rounded-md hover:bg-primary/90 transition-colors shadow-md ring-1 ring-primary">
                EDIT PEGAWAI
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
