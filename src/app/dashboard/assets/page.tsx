import prisma from "@/lib/prisma"
import Link from "next/link"
import { Search, Plus, QrCode, MoreVertical, Copy, Filter, ArrowUpDown, LayoutGrid, List, RefreshCw, X, ChevronRight } from "lucide-react"
import ExportExcelButton from "./ExportExcelButton"
import ExportPDFButton from "@/components/dashboard/ExportPDFButton"

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ nup?: string; categoryId?: string; status?: string; condition?: string; view?: string; detailId?: string }>
}) {
  const resolvedParams = await searchParams
  const currentView = resolvedParams.view || 'list'
  const detailId = resolvedParams.detailId
  
  const whereClause: any = {}
  
  if (resolvedParams.nup) {
    whereClause.OR = [
      { nup: { contains: resolvedParams.nup } },
      { assetCode: { contains: resolvedParams.nup } },
      { qrCode: { contains: resolvedParams.nup } }
    ]
  }
  
  if (resolvedParams.categoryId) {
    whereClause.categoryId = resolvedParams.categoryId
  }
  
  if (resolvedParams.status) {
    whereClause.status = resolvedParams.status
  }
  
  if (resolvedParams.condition) {
    whereClause.condition = resolvedParams.condition
  }

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: {
      category: true,
      user: true,
      room: {
        include: { location: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Ambil daftar kategori untuk dropdown filter
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  // Hitung jumlah filter yang aktif untuk badge
  const activeFiltersCount = (resolvedParams.categoryId ? 1 : 0) + (resolvedParams.status ? 1 : 0) + (resolvedParams.condition ? 1 : 0)

  // Helper untuk mempertahankan filter saat mengganti view (Grid/List)
  const buildUrl = (newView: string, overrideDetailId?: string | null) => {
    const params = new URLSearchParams()
    if (resolvedParams.nup) params.set('nup', resolvedParams.nup)
    if (resolvedParams.categoryId) params.set('categoryId', resolvedParams.categoryId)
    if (resolvedParams.status) params.set('status', resolvedParams.status)
    if (resolvedParams.condition) params.set('condition', resolvedParams.condition)
    if (newView !== 'list') params.set('view', newView)
    
    // Pertahankan detail view kecuali di-override null
    const finalDetailId = overrideDetailId !== undefined ? overrideDetailId : detailId
    if (finalDetailId) params.set('detailId', finalDetailId)

    return `/dashboard/assets?${params.toString()}`
  }

  // Fetch detail asset jika ada
  let detailAsset: any = null
  if (detailId) {
    detailAsset = await prisma.asset.findUnique({
      where: { id: detailId },
      include: {
        category: true,
        user: true,
        room: { include: { location: true } }
      }
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full items-start">
      {/* Kolom Tabel Utama */}
      <div className={`flex-1 flex flex-col bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 w-full ${detailAsset ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header Halaman (Mirip FASIH) */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Data</h1>
          <p className="text-sm text-slate-500">Data hasil pendataan Barang Milik Negara</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <ExportExcelButton data={assets} />
          <ExportPDFButton assets={assets} />
          <Link href="/dashboard/qr/print" className="flex items-center justify-center rounded-md bg-white border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-md" title="Cetak Label QR (A4)">
            <QrCode className="mr-2 h-4 w-4 text-slate-500" /> Cetak QR
          </Link>
          <Link href="/dashboard/assets/create" className="flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-md">
            <Plus className="mr-1.5 h-4 w-4" /> Tambah BMN
          </Link>
        </div>
      </div>

      {/* Toolbar Tabel (Aktif & Berfungsi) */}
      <form method="GET" className="p-4 bg-white flex flex-col gap-4">
        {/* Simpan status view saat filter disubmit */}
        <input type="hidden" name="view" value={currentView} />
        
        {/* Checkbox Rahasia untuk toggle filter mobile */}
        <input type="checkbox" id="toggle-filter" className="peer hidden" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter Kategori Aktual */}
            <div className="relative border border-slate-300 bg-white rounded-md hover:bg-slate-50 shadow-md flex items-center">
               <List className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
               <select 
                 name="categoryId" 
                 defaultValue={resolvedParams.categoryId || ""} 
                 className="appearance-none bg-transparent pl-9 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none w-36 sm:w-48 cursor-pointer"
               >
                  <option value="">Semua Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 pointer-events-none" />
            </div>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-1 py-1 shadow-md">
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">{assets.length}</span>
              <span className="text-xs font-semibold text-slate-600 px-2 uppercase">Data Tersaring</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Status Aktual */}
            <div className="relative border border-slate-300 bg-white rounded-md hover:bg-slate-50 shadow-md flex items-center hidden sm:flex">
               <span className="text-sm text-slate-500 absolute left-3 pointer-events-none">Status:</span>
               <select 
                 name="status" 
                 defaultValue={resolvedParams.status || ""} 
                 className="appearance-none bg-transparent pl-16 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none cursor-pointer"
               >
                  <option value="">Semua</option>
                  <option value="TERSEDIA">Tersedia</option>
                  <option value="DIPINJAM">Dipinjam</option>
                  <option value="DIGUNAKAN">Digunakan</option>
                  <option value="DALAM_PEMELIHARAAN">Pemeliharaan</option>
               </select>
               <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
            
            {/* Filter Kondisi Aktual */}
            <div className="relative border border-slate-300 bg-white rounded-md hover:bg-slate-50 shadow-md flex items-center hidden lg:flex">
               <span className="text-sm text-slate-500 absolute left-3 pointer-events-none">Kondisi:</span>
               <select 
                 name="condition" 
                 defaultValue={resolvedParams.condition || ""} 
                 className="appearance-none bg-transparent pl-16 pr-8 py-1.5 text-sm text-slate-700 focus:outline-none cursor-pointer"
               >
                  <option value="">Semua</option>
                  <option value="BAIK">Baik</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan</option>
                  <option value="RUSAK_BERAT">Rusak Berat</option>
               </select>
               <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-md p-1.5 shadow-md">
          <div className="relative w-full max-w-md flex-1">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              name="nup"
              defaultValue={resolvedParams.nup || ""}
              placeholder="Cari NUP, Kode Identitas..." 
              className="w-full bg-transparent pl-9 pr-4 py-1.5 text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
            <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-primary hover:bg-primary/90 rounded-md font-medium shadow-md transition-colors">
              <Search className="w-4 h-4" /> <span className="hidden sm:inline">Cari</span>
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <Link href={`/dashboard/assets${resolvedParams.view === 'grid' ? '?view=grid' : ''}`} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md" title="Reset Semua Filter"><RefreshCw className="w-4 h-4" /></Link>
            
            {/* Tombol Grid View (Link agar tidak bentrok dengan form submit) */}
            <Link 
              href={buildUrl('grid')}
              className={`inline-block p-1.5 rounded-md shadow-md transition-colors ${currentView === 'grid' ? 'text-white bg-amber-500' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
              title="Tampilan Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>
            
            {/* Tombol List View (Link) */}
            <Link 
              href={buildUrl('list')}
              className={`inline-block p-1.5 rounded-md shadow-md transition-colors ${currentView === 'list' ? 'text-white bg-amber-500' : 'text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </Link>
            
            {/* Tombol Filter */}
            <label htmlFor="toggle-filter" className="relative p-1.5 text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer ml-1 border border-slate-200 shadow-md" title="Tampilkan/Sembunyikan Filter">
              <Filter className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full border border-white">
                  {activeFiltersCount}
                </span>
              )}
            </label>
          </div>
        </div>
      </form>

      {/* Tampilan Berdasarkan Pilihan (Grid / List) */}
      {currentView === 'grid' ? (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="bg-white border border-slate-200 rounded-md p-4 shadow-md hover:shadow-md transition-shadow flex flex-col relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-xs font-semibold text-slate-800 border-b border-dashed border-slate-400 pb-0.5">{asset.nup} - {asset.assetCode}</div>
                  <Link href={buildUrl(currentView, asset.id)} className="text-slate-400 hover:text-slate-800">
                    <MoreVertical className="w-4 h-4" />
                  </Link>
                </div>
                <div className="font-bold text-slate-800 uppercase text-sm mt-1 mb-1">{asset.name}</div>
                <div className="text-xs text-slate-500 mb-3">{asset.category?.name} &bull; {asset.brand}</div>
                
                <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5 text-slate-400" /> {asset.room ? asset.room.name : '-'}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                      asset.condition === 'BAIK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {asset.condition.replace('_', ' ')}
                    </span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                      asset.status === 'TERSEDIA' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-primary/5 text-primary border-blue-200'
                    }`}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                Belum ada data hasil pendataan.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-y border-slate-200 bg-white text-slate-600 font-medium text-xs">
              <tr>
                <th className="px-4 py-2.5 w-10 text-center"><input type="checkbox" className="rounded-md border-slate-300 accent-amber-500" /></th>
                <th className="px-4 py-2.5 whitespace-nowrap cursor-pointer hover:bg-slate-50">Kode Identitas <ArrowUpDown className="inline w-3 h-3 ml-1 text-slate-400" /></th>
                <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">Nama Aset / Kategori <Filter className="inline w-3 h-3 ml-1 text-slate-400" /></th>
                <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">Alamat / Lokasi <Filter className="inline w-3 h-3 ml-1 text-slate-400" /></th>
                <th className="px-4 py-2.5 w-24 text-center">Status</th>
                <th className="px-4 py-2.5 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded-md border-slate-300 accent-amber-500" /></td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="font-semibold text-slate-800 border-b border-dashed border-slate-400 pb-0.5">{asset.nup} - {asset.assetCode}</span>
                    <button className="ml-2 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-3.5 h-3.5" /></button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 uppercase text-xs tracking-tight">{asset.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{asset.category?.name} &bull; {asset.brand}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-slate-800">{asset.room ? asset.room.name : '-'}</div>
                    {asset.user && <div className="text-slate-500 mt-0.5">PIC: {asset.user.name}</div>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        asset.condition === 'BAIK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {asset.condition.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                        asset.status === 'TERSEDIA' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-primary/5 text-primary border-blue-200'
                      }`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={buildUrl(currentView, asset.id)} className="inline-flex p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500 text-sm">
                    Belum ada data hasil pendataan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Panel Layar ke-3: Detail Aset */}
      {detailAsset && (
        <div className="w-full lg:w-[380px] bg-white rounded-md shadow-lg border border-slate-200/80 flex flex-col shrink-0 sticky top-0 animate-detail-pane">
          <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center z-10 sticky top-0">
             <h3 className="font-bold text-slate-800 text-[13px] tracking-widest uppercase opacity-90">Detail Aset</h3>
             <Link href={buildUrl(currentView, null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
               <X className="w-4 h-4" />
             </Link>
          </div>
          
          <div className="p-6 flex-1">
            <div className="inline-block px-2 py-1 bg-slate-100/80 text-slate-600 rounded-md font-mono text-[11px] font-bold tracking-wide mb-3 border border-slate-200/50">
              {detailAsset.nup} &bull; {detailAsset.assetCode}
            </div>
            
            <h2 className="font-black text-slate-900 uppercase text-xl leading-tight mb-6">{detailAsset.name}</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kategori & Merk</span>
                 <span className="text-sm font-semibold text-slate-700">{detailAsset.category?.name} &bull; {detailAsset.brand || '-'}</span>
              </div>
              
              <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Lokasi / Penempatan</span>
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-white shadow-md border border-slate-200 rounded-md">
                     <LayoutGrid className="w-4 h-4 text-blue-500" />
                   </div>
                   <div>
                     <span className="text-sm font-semibold text-slate-800">{detailAsset.room ? detailAsset.room.name : 'Belum Ditempatkan'}</span>
                     {detailAsset.room?.location && <span className="text-xs text-slate-500 block">{detailAsset.room.location.name}</span>}
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tahun</span>
                   <span className="text-sm font-bold text-slate-700">{detailAsset.acquisitionYear || '-'}</span>
                </div>
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Nilai Aset</span>
                   <span className="text-sm font-bold text-emerald-600">Rp {(detailAsset.acquisitionValue || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Ketersediaan</span>
                   <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border shadow-md ${
                      detailAsset.status === 'TERSEDIA' ? 'bg-slate-50 text-slate-700 border-slate-200' : 
                      detailAsset.status === 'DIPINJAM' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      'bg-primary/5 text-primary border-blue-200'
                    }`}>
                      {detailAsset.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="bg-slate-50/50 p-3.5 rounded-md border border-slate-100">
                   <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Kondisi Fisik</span>
                   <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border shadow-md ${
                      detailAsset.condition === 'BAIK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      detailAsset.condition === 'RUSAK_RINGAN' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {detailAsset.condition.replace('_', ' ')}
                    </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 pt-2 pb-2">
               <Link href={`/dashboard/assets/${detailAsset.id}/edit`} className="flex-1 bg-primary text-white text-center py-2.5 text-xs font-bold rounded-md hover:bg-primary/90 transition-colors shadow-md ring-1 ring-primary">EDIT</Link>
               <Link href={`/dashboard/assets/${detailAsset.id}`} className="flex-1 bg-white text-slate-700 border border-slate-300 text-center py-2.5 text-xs font-bold rounded-md hover:bg-slate-50 transition-colors shadow-md flex items-center justify-center group">LENGKAP <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:text-slate-700 transition-colors" /></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
