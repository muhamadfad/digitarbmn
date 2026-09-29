import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, PenSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const asset = await prisma.asset.findUnique({
    where: { id: id },
    include: {
      category: true,
      assetType: true,
      location: true,
      room: true,
      unit: true,
      user: true,
      auditLogs: {
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      },
      borrowings: {
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      },
      maintenances: {
        orderBy: { createdAt: 'desc' },
        include: { complaint: true }
      },
      assessments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!asset) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* HEADER ASET */}
      <div className="bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/assets" className="p-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shadow-md text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">{asset.name}</h1>
            <p className="text-sm font-mono text-slate-500 font-semibold">{asset.nup} &bull; {asset.assetCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/dashboard/qr/${asset.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-bold hover:bg-slate-50 transition-colors text-slate-700 shadow-md uppercase tracking-wider">
            <QrCode className="w-4 h-4" /> Cetak QR
          </Link>
          <Link href={`/dashboard/assets/${asset.id}/edit`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary border border-primary text-white rounded-md text-sm font-bold hover:bg-primary/90 transition-colors shadow-md uppercase tracking-wider">
            <PenSquare className="w-4 h-4" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* SIDEBAR KIRI: INFO KONDISI, STATUS & LOKASI */}
        <div className="md:col-span-1 space-y-4">
          {/* Card Status & Kondisi */}
          <div className="bg-white rounded-md border border-slate-200 shadow-md overflow-hidden flex flex-col">
            {asset.photo && (
              <div className="w-full bg-slate-50 border-b border-slate-200 flex justify-center items-center p-3 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.photo} alt={asset.name} className="max-h-48 object-contain rounded-md shadow-md border border-slate-200 bg-white" />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Status & Kondisi</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Status Penggunaan</p>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase border shadow-md ${
                    asset.status === 'TERSEDIA' ? 'bg-slate-50 text-slate-700 border-slate-200' : 
                    asset.status === 'DIPINJAM' || asset.status === 'DIGUNAKAN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                    asset.status === 'DALAM_PEMELIHARAAN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kondisi Fisik</p>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase border shadow-md ${
                    asset.condition === 'BAIK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    asset.condition === 'RUSAK_RINGAN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {asset.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 shadow-md p-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Lokasi & PIC</h3>
            
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Lokasi</p>
                  <p className="text-sm font-semibold text-slate-800">{asset.room?.name || '-'}</p>
                  <p className="text-xs text-slate-500">{asset.location?.name || '-'}</p>
               </div>
               
               <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Unit Pengelola</p>
                  <p className="text-sm font-semibold text-slate-800">{asset.unit?.name || '-'}</p>
               </div>
               
               <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">PIC (Pemegang Saat Ini)</p>
                  {asset.user ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-black shadow-md ring-1 ring-blue-200">
                        {asset.user.name.charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-none">{asset.user.name}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">-</p>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* MAIN TABS AREA */}
        <div className="md:col-span-3">
          <Tabs defaultValue="overview" className="w-full bg-white rounded-md border border-slate-200 shadow-md overflow-hidden flex flex-col h-full">
            <TabsList className="w-full justify-start bg-slate-50 border-b border-slate-200 rounded-none h-auto p-0 overflow-x-auto flex-nowrap">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:border-b-blue-600 data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Overview</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:border-b-blue-600 data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Riwayat</TabsTrigger>
              <TabsTrigger value="borrowing" className="data-[state=active]:bg-white data-[state=active]:border-b-blue-600 data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Peminjaman</TabsTrigger>
              <TabsTrigger value="maintenance" className="data-[state=active]:bg-white data-[state=active]:border-b-blue-600 data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Maintenance</TabsTrigger>
              <TabsTrigger value="assessment" className="data-[state=active]:bg-white data-[state=active]:border-b-blue-600 data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Assessment</TabsTrigger>
            </TabsList>

            <div className="p-0 flex-1">
              
              <TabsContent value="overview" className="m-0 p-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Informasi Spesifikasi BMN</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Merk / Tipe</p>
                    <p className="text-sm font-bold text-slate-800">{asset.brand || '-'} {asset.type ? `/ ${asset.type}` : ''}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Nomor Seri (SN)</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">{asset.serialNumber || '-'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tahun Perolehan</p>
                    <p className="text-sm font-bold text-slate-800">{asset.acquisitionYear || '-'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Nilai Perolehan</p>
                    <p className="text-sm font-bold text-emerald-600">{asset.acquisitionValue ? `Rp ${asset.acquisitionValue.toLocaleString('id-ID')}` : '-'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kategori</p>
                    <p className="text-sm font-bold text-slate-800">{asset.category?.name || '-'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Jenis Aset</p>
                    <p className="text-sm font-bold text-slate-800">{asset.assetType?.name || '-'}</p>
                  </div>
                </div>
                
                {asset.notes && (
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-4">
                    <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider mb-1.5">Keterangan Tambahan</p>
                    <p className="text-sm font-medium text-amber-900 leading-relaxed">{asset.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="m-0 p-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Timeline Riwayat Aset (Audit Log)</h3>
                <div className="relative border-l border-slate-200 ml-2 space-y-6">
                  {asset.auditLogs.length > 0 ? asset.auditLogs.map((log) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute w-2.5 h-2.5 bg-primary/50 rounded-full -left-[5px] top-1.5 ring-4 ring-white" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {new Date(log.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                      {log.user && (
                        <p className="text-xs text-slate-500 mt-2 font-medium">PIC / Oleh: {log.user.name}</p>
                      )}
                    </div>
                  )) : (
                    <div className="pl-6 text-sm font-medium text-slate-500 py-4">Belum ada riwayat aktivitas untuk aset ini.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="borrowing" className="m-0 p-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Riwayat Peminjaman</h3>
                <div className="text-sm font-medium text-slate-500 py-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-md">
                  Menampilkan histori peminjaman aset ini. (Segera hadir)
                </div>
              </TabsContent>

              <TabsContent value="maintenance" className="m-0 p-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Riwayat Maintenance</h3>
                <div className="text-sm font-medium text-slate-500 py-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-md">
                  Menampilkan catatan perbaikan dan pemeliharaan. (Segera hadir)
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="m-0 p-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3">Riwayat Assessment</h3>
                <div className="text-sm font-medium text-slate-500 py-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-md">
                  Menampilkan hasil assessment kelayakan secara berkala. (Segera hadir)
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
