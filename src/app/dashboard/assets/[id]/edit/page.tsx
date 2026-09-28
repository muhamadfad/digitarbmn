import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { notFound } from "next/navigation"

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const asset = await prisma.asset.findUnique({
    where: { id: id }
  })
  
  if (!asset) return notFound()

  const categories = await prisma.category.findMany()
  const locations = await prisma.location.findMany({ include: { rooms: true } })
  const users = await prisma.user.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/assets/${asset.id}`} className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Data BMN</h1>
          <p className="text-muted-foreground">Perbarui informasi aset Barang Milik Negara</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm p-6">
        <form className="space-y-6" action="/api/assets/edit" method="POST" encType="multipart/form-data">
          <input type="hidden" name="id" value={asset.id} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nomor Urut Pendaftaran (NUP)</label>
              <input type="text" name="nup" required defaultValue={asset.nup} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kode Aset</label>
              <input type="text" name="assetCode" required defaultValue={asset.assetCode} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Nama Aset</label>
              <input type="text" name="name" required defaultValue={asset.name} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Merk</label>
              <input type="text" name="brand" defaultValue={asset.brand || ""} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipe</label>
              <input type="text" name="type" defaultValue={asset.type || ""} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kategori</label>
              <select name="categoryId" required defaultValue={asset.categoryId} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ruangan/Lokasi</label>
              <select name="roomId" defaultValue={asset.roomId || ""} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                <option value="">-- Tidak ditempatkan --</option>
                {locations.flatMap(l => l.rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} - {l.name}</option>
                )))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Harga Beli / Perolehan (Rp)</label>
              <input type="number" name="acquisitionValue" defaultValue={asset.acquisitionValue || ""} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Contoh: 15000000" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tahun Perolehan</label>
              <input type="number" name="acquisitionYear" defaultValue={asset.acquisitionYear || ""} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="Contoh: 2023" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kondisi</label>
              <select name="condition" defaultValue={asset.condition} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <select name="status" defaultValue={asset.status} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                <option value="TERSEDIA">Tersedia</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="DIGUNAKAN">Digunakan</option>
                <option value="DALAM_PEMELIHARAAN">Dalam Pemeliharaan</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Pemegang / Penanggung Jawab Saat Ini</label>
              <select name="userId" defaultValue={asset.userId || ""} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">-- Tidak ada (Berada di Gudang/Ruangan) --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role?.name || 'Pegawai'})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Ubah Foto Barang</label>
              <input type="file" name="photo" accept="image/*" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              {asset.photo && <p className="text-xs text-muted-foreground mt-1">Aset ini sudah memiliki foto. Kosongkan jika tidak ingin mengubah foto.</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href={`/dashboard/assets/${asset.id}`} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
