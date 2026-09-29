import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Box, Wrench, Handshake, AlertTriangle, FileText } from "lucide-react"
import DashboardCharts from "@/components/dashboard/DashboardCharts"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // --- TAMPILAN KHUSUS PEGAWAI (PENGGUNA BMN) ---
  if (session.user.role === 'PENGGUNA_BMN') {
    const myAssets = await prisma.asset.findMany({
      where: { userId: session.user.id },
      include: { category: true, room: true }
    })
    const myBorrowings = await prisma.borrowing.findMany({
      where: { userId: session.user.id, status: { in: ['MENUNGGU_PERSETUJUAN', 'DIPINJAM'] } },
      include: { asset: true },
      orderBy: { createdAt: 'desc' }
    })

    return (
      <div className="space-y-6">
        {/* Banner Pegawai */}
        <div className="bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">Beranda Pegawai</h1>
              <p className="text-sm text-slate-500">Selamat datang kembali, <strong>{session.user.name}</strong></p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-md hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-primary/50"></div>
              <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">PENGGUNA BMN</span>
            </div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">Menu Cepat</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/dashboard/scanner" className="flex flex-col items-center justify-center p-3 bg-white rounded-md border border-slate-200 shadow-md hover:border-blue-400 hover:bg-primary/5 transition-colors text-slate-700 hover:text-primary">
              <Box className="w-6 h-6 mb-2 text-primary" />
              <span className="text-xs font-semibold text-center">Scan QR</span>
            </Link>
            <Link href="/dashboard/borrowings/create" className="flex flex-col items-center justify-center p-3 bg-white rounded-md border border-slate-200 shadow-md hover:border-blue-400 hover:bg-primary/5 transition-colors text-slate-700 hover:text-primary">
              <Handshake className="w-6 h-6 mb-2 text-primary" />
              <span className="text-xs font-semibold text-center">Pinjam BMN</span>
            </Link>
            <Link href="/dashboard/assessments/create" className="flex flex-col items-center justify-center p-3 bg-white rounded-md border border-slate-200 shadow-md hover:border-blue-400 hover:bg-primary/5 transition-colors text-slate-700 hover:text-primary">
              <AlertTriangle className="w-6 h-6 mb-2 text-primary" />
              <span className="text-xs font-semibold text-center">Lapor Rusak</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Aset Saya */}
          <div className="bg-white border border-slate-200 rounded-md shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Box className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-800 text-lg">Aset Tanggung Jawab Saya</h3>
            </div>
            <div className="p-0">
              {myAssets.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {myAssets.map(asset => (
                    <li key={asset.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{asset.name}</p>
                        <p className="text-xs text-slate-500 mt-1">NUP: {asset.nup} &bull; {asset.brand} {asset.type}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        asset.condition === 'BAIK' ? 'bg-emerald-100 text-emerald-700' : 
                        asset.condition === 'RUSAK_RINGAN' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {asset.condition.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                    <Box className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 font-medium">Belum ada aset yang ditugaskan ke Anda.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card Status Peminjaman */}
          <div className="bg-white border border-slate-200 rounded-md shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Handshake className="w-5 h-5" /></div>
              <h3 className="font-bold text-slate-800 text-lg">Status Peminjaman Aktif</h3>
            </div>
            <div className="p-0">
              {myBorrowings.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {myBorrowings.map(b => (
                    <li key={b.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-slate-900 text-base">{b.asset.name}</p>
                        <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full ${b.status === 'DIPINJAM' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">NUP: {b.asset.nup} &bull; Keperluan: {b.purpose}</p>
                      <p className="text-xs font-medium text-slate-600">Durasi: {b.borrowDate.toLocaleDateString('id-ID')} - {b.estReturnDate.toLocaleDateString('id-ID')}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                    <Handshake className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 font-medium">Anda tidak memiliki pengajuan peminjaman aktif.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- TAMPILAN ADMIN / PENGELOLA ---
  // Fetch stats from DB
  const totalAssets = await prisma.asset.count()
  const availableAssets = await prisma.asset.count({ where: { status: 'TERSEDIA' } })
  const borrowedAssets = await prisma.asset.count({ where: { status: 'DIPINJAM' } })
  const maintenanceAssets = await prisma.asset.count({ where: { status: 'DALAM_PEMELIHARAAN' } })
  
  // Hitung total nilai aset
  const assetsWithValue = await prisma.asset.findMany({ select: { acquisitionValue: true } })
  const totalValue = assetsWithValue.reduce((acc, curr) => acc + (curr.acquisitionValue || 0), 0)

  const goodAssets = await prisma.asset.count({ where: { condition: 'BAIK' } })
  const lightDamage = await prisma.asset.count({ where: { condition: 'RUSAK_RINGAN' } })
  const heavyDamage = await prisma.asset.count({ where: { condition: 'RUSAK_BERAT' } })

  const activeMaintenances = await prisma.maintenance.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } })
  const pendingBorrowings = await prisma.borrowing.count({ where: { status: 'MENUNGGU_PERSETUJUAN' } })

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="bg-white rounded-none sm:rounded-md shadow-md border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Dashboard Eksekutif BMN</h1>
          <p className="text-sm text-slate-500">Ringkasan data, nilai aset, dan status operasional Barang Milik Negara.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-md w-full sm:w-auto justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">{session.user.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Aksi Cepat Admin */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/dashboard/assets/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white p-3 rounded-md shadow-md transition-colors border border-primary">
          <Box className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Tambah Aset</span>
        </Link>
        <Link href="/dashboard/borrowings" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-md shadow-md transition-colors border border-slate-200">
          <Handshake className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold uppercase tracking-wide">Persetujuan</span>
          {pendingBorrowings > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1">{pendingBorrowings}</span>
          )}
        </Link>
        <Link href="/dashboard/scanner" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-md shadow-md transition-colors border border-slate-200">
          <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          <span className="text-xs font-bold uppercase tracking-wide">Scan QR</span>
        </Link>
        <Link href="/dashboard/analytics" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 p-3 rounded-md shadow-md transition-colors border border-slate-200">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wide">Laporan</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-md shadow-md border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total BMN</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{totalAssets}</p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-md border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md">
            <span className="font-black text-sm leading-none flex items-center h-5">Rp</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Nilai Aset (Jt)</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{(totalValue / 1000000).toFixed(1)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-md shadow-md border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-md">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Dipinjam</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{borrowedAssets}</p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-md border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{pendingBorrowings}</p>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-md border border-slate-200 p-5 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-md">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Perbaikan</p>
            <p className="text-xl font-bold tracking-tight text-slate-800">{activeMaintenances}</p>
          </div>
        </div>
      </div>

      {/* Interaktif Charts (Recharts) */}
      <DashboardCharts />
    </div>
  )
}
