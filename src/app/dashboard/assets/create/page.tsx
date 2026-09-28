import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import QRScannerField from "./QRScannerField"

export default async function CreateAssetPage() {
  const categories = await prisma.category.findMany()
  const types = await prisma.assetType.findMany()
  const locations = await prisma.location.findMany({ include: { rooms: true } })
  const units = await prisma.unit.findMany()
  const users = await prisma.user.findMany({ 
    where: { isActive: true }, 
    include: { role: true },
    orderBy: { name: 'asc' } 
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/assets" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tambah BMN Baru</h1>
          <p className="text-muted-foreground">Masukkan data detail aset Barang Milik Negara</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <form className="space-y-6" action="/api/assets/create" method="POST" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nomor Urut Pendaftaran (NUP)</label>
              <input type="text" name="nup" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Contoh: 10001" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kode Aset</label>
              <input type="text" name="assetCode" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Contoh: 3.02.01.01.001" />
            </div>

            <QRScannerField />

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Nama Aset</label>
              <input type="text" name="name" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Nama BMN (Laptop, Meja, dll)" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Merk</label>
              <input type="text" name="brand" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipe</label>
              <input type="text" name="type" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kategori</label>
              <select name="categoryId" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ruangan/Lokasi</label>
              <select name="roomId" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">-- Tidak ditempatkan --</option>
                {locations.flatMap(l => l.rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} - {l.name}</option>
                )))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Harga Beli / Perolehan (Rp)</label>
              <input type="number" name="acquisitionValue" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Contoh: 15000000" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tahun Perolehan</label>
              <input type="number" name="acquisitionYear" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Contoh: 2023" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kondisi</label>
              <select name="condition" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select name="status" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="DIGUNAKAN">Digunakan</option>
                <option value="DALAM_PEMELIHARAAN">Dalam Pemeliharaan</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Pemegang / Penanggung Jawab Saat Ini</label>
              <select name="userId" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">-- Tidak ada (Berada di Gudang/Ruangan) --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role?.name || 'Pegawai'})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Foto Barang</label>
              <input type="file" name="photo" accept="image/*" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard/assets" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              <Save className="w-4 h-4" /> Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
