import prisma from "@/lib/prisma"
import Link from "next/link"
import { Plus, ListTree, MapPin, LayoutGrid, Building } from "lucide-react"

export default async function MasterDataPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  // Resolve the searchParams Promise (Next.js 15+)
  const params = await searchParams
  const tab = params.tab || 'category'

  // Fetch data based on the active tab
  let data: any[] = []
  
  if (tab === 'category') {
    data = await prisma.category.findMany({
      include: { _count: { select: { assets: true } } },
      orderBy: { name: 'asc' }
    })
  } else if (tab === 'location') {
    data = await prisma.location.findMany({
      include: { _count: { select: { rooms: true, assets: true } } },
      orderBy: { name: 'asc' }
    })
  } else if (tab === 'room') {
    data = await prisma.room.findMany({
      include: { 
        location: true,
        _count: { select: { assets: true } } 
      },
      orderBy: { name: 'asc' }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-none sm:rounded-sm shadow-sm border border-slate-200 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Master Data</h1>
            <p className="text-sm text-slate-500">Kelola data referensi Kategori, Lokasi, dan Ruangan</p>
          </div>
          <Link href={`/dashboard/master/${tab}/create`} className="flex items-center justify-center rounded-sm bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors">
            <Plus className="mr-1.5 h-4 w-4" /> Tambah {tab === 'category' ? 'Kategori' : tab === 'location' ? 'Lokasi' : 'Ruangan'}
          </Link>
        </div>
      </div>

      {/* Tabs & Table Container */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 flex flex-col">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 sm:px-4">
          <Link 
            href="?tab=category" 
            className={`flex items-center px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              tab === 'category' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" /> Kategori Aset
          </Link>
          <Link 
            href="?tab=location" 
            className={`flex items-center px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              tab === 'location' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4 mr-2" /> Lokasi / Gedung
          </Link>
          <Link 
            href="?tab=room" 
            className={`flex items-center px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              tab === 'room' ? 'border-amber-500 text-amber-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4 mr-2" /> Ruangan
          </Link>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-white text-slate-600 font-medium text-xs">
              <tr>
                <th className="px-5 py-3">Kode</th>
                <th className="px-5 py-3">Nama {tab === 'category' ? 'Kategori' : tab === 'location' ? 'Lokasi' : 'Ruangan'}</th>
                {tab === 'room' && <th className="px-5 py-3">Lokasi (Gedung)</th>}
                <th className="px-5 py-3 text-center">Jumlah Aset</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.code}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{item.name}</td>
                  {tab === 'room' && (
                    <td className="px-5 py-3 text-slate-600 text-xs">
                      {item.location?.name || '-'}
                    </td>
                  )}
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-sm border bg-slate-50 text-slate-600 border-slate-200">
                      {item._count?.assets || 0} Aset
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold mr-3">Edit</button>
                    <button className="text-rose-600 hover:text-rose-800 text-xs font-semibold">Hapus</button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={tab === 'room' ? 5 : 4} className="px-5 py-12 text-center text-slate-500 text-sm">
                    Belum ada data {tab === 'category' ? 'Kategori' : tab === 'location' ? 'Lokasi' : 'Ruangan'}.
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
