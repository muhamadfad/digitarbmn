import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, User, Box, Calendar, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react"

export default async function BorrowingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  const borrowing = await prisma.borrowing.findUnique({
    where: { id },
    include: {
      asset: {
        include: { category: true }
      },
      user: {
        include: { unit: true }
      }
    }
  })

  if (!borrowing) {
    notFound()
  }

  // Jika Pegawai biasa, mereka hanya boleh melihat peminjaman mereka sendiri atau peminjaman barang mereka
  if (role === 'PENGGUNA_BMN' || role === 'PENANGGUNG_JAWAB_RUANGAN') {
    if (borrowing.userId !== session?.user?.id && borrowing.asset.userId !== session?.user?.id) {
      notFound()
    }
  }

  const isAdminOrManager = role === 'ADMIN' || role === 'PENGELOLA_BMN' || role === 'PIMPINAN'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/borrowings" className="p-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Detail Peminjaman</h1>
          <p className="text-sm text-slate-500">ID Transaksi: {borrowing.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-md border border-slate-300 shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Informasi Peminjam</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Nama</p>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> {borrowing.user.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Unit / Bagian</p>
                <p className="font-medium text-slate-900">{borrowing.user.unit?.name || '-'}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-sm text-slate-500">Keperluan</p>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mt-1">
                  {borrowing.purpose}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-300 shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Detail Barang Milik Negara</h3>
            <div className="flex items-start gap-4">
              <div className="p-4 bg-slate-100 rounded-md border border-slate-200">
                <Box className="w-8 h-8 text-slate-500" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nama Aset</p>
                  <p className="font-bold text-slate-900">{borrowing.asset.name}</p>
                  <p className="text-xs text-slate-500">{borrowing.asset.nup} | {borrowing.asset.assetCode}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Kategori</p>
                  <p className="font-medium text-slate-900">{borrowing.asset.category?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Merk / Tipe</p>
                  <p className="font-medium text-slate-900">{borrowing.asset.brand || '-'} {borrowing.asset.type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Kondisi Saat Ini</p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                    borrowing.asset.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {borrowing.asset.condition.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-md border border-slate-300 shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Status Peminjaman</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Status Saat Ini</p>
                <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold border ${
                  borrowing.status === 'SELESAI' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  borrowing.status === 'MENUNGGU_PERSETUJUAN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  borrowing.status === 'DITOLAK' || borrowing.status === 'DIBATALKAN' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-primary/5 text-primary border-blue-200'
                }`}>
                  {borrowing.status === 'SELESAI' && <CheckCircle className="w-4 h-4" />}
                  {borrowing.status === 'MENUNGGU_PERSETUJUAN' && <Clock className="w-4 h-4" />}
                  {(borrowing.status === 'DITOLAK' || borrowing.status === 'DIBATALKAN') && <XCircle className="w-4 h-4" />}
                  {borrowing.status === 'DISETUJUI' && <CheckCircle className="w-4 h-4" />}
                  {borrowing.status.replace(/_/g, ' ')}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500">Tanggal Pinjam</p>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Rencana Pengembalian</p>
                <p className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> {borrowing.estReturnDate ? new Date(borrowing.estReturnDate).toLocaleDateString('id-ID') : '-'}
                </p>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdminOrManager && borrowing.status === 'MENUNGGU_PERSETUJUAN' && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Tindakan Admin</p>
                <form action={`/api/borrowings/${borrowing.id}/status`} method="POST" className="flex flex-col gap-2">
                  <input type="hidden" name="action" value="APPROVE" />
                  <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-md transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Setujui & Serahkan
                  </button>
                </form>
                <form action={`/api/borrowings/${borrowing.id}/status`} method="POST" className="flex flex-col gap-2">
                  <input type="hidden" name="action" value="REJECT" />
                  <button type="submit" className="w-full py-2 bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 font-semibold rounded-md shadow-md transition-colors flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> Tolak Pengajuan
                  </button>
                </form>
              </div>
            )}

            {isAdminOrManager && borrowing.status === 'DISETUJUI' && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Penyelesaian Transaksi</p>
                <form action={`/api/borrowings/${borrowing.id}/status`} method="POST" className="flex flex-col gap-2">
                  <input type="hidden" name="action" value="COMPLETE" />
                  <button type="submit" className="w-full py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-md shadow-md transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" /> BMN Telah Dikembalikan
                  </button>
                </form>
              </div>
            )}
            
            {!isAdminOrManager && borrowing.status === 'MENUNGGU_PERSETUJUAN' && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-center text-slate-500">Menunggu persetujuan dari pengelola BMN.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
