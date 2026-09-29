import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Handshake, ClipboardCheck, AlertCircle } from "lucide-react"

export default async function QRResultPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const resolvedParams = await searchParams
  const code = resolvedParams.code

  if (!code) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Kode tidak ditemukan</h2>
        <Link href="/dashboard/qr" className="text-primary mt-4 inline-block">Kembali Scan</Link>
      </div>
    )
  }

  // Cari aset berdasarkan nup, assetCode, atau qrCode
  const asset = await prisma.asset.findFirst({
    where: {
      OR: [
        { nup: code },
        { assetCode: code },
        { qrCode: code }
      ]
    },
    include: {
      category: true,
      room: { include: { location: true } }
    }
  })

  if (!asset) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-card border rounded-xl shadow-md text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-2">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Aset Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500">
          Sistem tidak dapat menemukan BMN dengan kode/NUP <strong>{code}</strong>. Pastikan QR Code yang discan benar.
        </p>
        <Link href="/dashboard/qr" className="inline-block mt-4 px-6 py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
          Kembali ke Pemindai
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/qr" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hasil Scan BMN</h1>
          <p className="text-muted-foreground">Pilih tindakan untuk aset yang ditemukan</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b bg-slate-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{asset.name}</h2>
              <p className="text-sm text-slate-500 mt-1">NUP: {asset.nup} &bull; Kode: {asset.assetCode}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              asset.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-700' :
              asset.condition === 'RUSAK_RINGAN' ? 'bg-amber-100 text-amber-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {asset.condition.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Kategori</p>
              <p className="font-medium text-slate-900">{asset.category?.name || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Lokasi / Ruang</p>
              <p className="font-medium text-slate-900">{asset.room ? `${asset.room.location.name} - ${asset.room.name}` : '-'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 mb-4">Pilih Tindakan:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href={`/dashboard/borrowings/create?assetId=${asset.id}`}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                asset.status === 'TERSEDIA' 
                  ? 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300' 
                  : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed pointer-events-none'
              }`}
            >
              <div className="bg-white p-3 rounded-full shadow-md mb-3">
                <Handshake className={`w-6 h-6 ${asset.status === 'TERSEDIA' ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <span className={`font-bold ${asset.status === 'TERSEDIA' ? 'text-indigo-900' : 'text-slate-500'}`}>Ajukan Peminjaman</span>
              {asset.status !== 'TERSEDIA' && (
                <span className="text-xs text-rose-500 mt-2 font-medium">Aset sedang {asset.status.replace('_', ' ').toLowerCase()}</span>
              )}
            </Link>

            <Link 
              href={`/dashboard/assessments/create?assetId=${asset.id}`}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
            >
              <div className="bg-white p-3 rounded-full shadow-md mb-3">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="font-bold text-emerald-900">Lapor Cek Fisik (Assessment)</span>
              <span className="text-xs text-emerald-700/70 mt-2 text-center">Laporkan kondisi atau kerusakan barang</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
