import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"

export default async function CreateComplaintPage() {
  const assets = await prisma.asset.findMany({
    include: { category: true }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/complaints" className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pengaduan Kerusakan BMN</h1>
          <p className="text-muted-foreground">Formulir pelaporan kerusakan atau kendala pada aset</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-md p-6">
        <form className="space-y-6" action="/api/complaints/create" method="POST">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pilih Aset BMN yang Rusak</label>
              <select name="assetId" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">-- Cari NUP / Nama Aset --</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.nup})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tingkat Urgensi / Prioritas</label>
              <select name="priority" required defaultValue="SEDANG" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="RENDAH">Rendah (Kerusakan minor, aset masih bisa dipakai sebagian)</option>
                <option value="SEDANG">Sedang (Aset tidak berfungsi normal, menghambat kerja)</option>
                <option value="TINGGI">Tinggi (Darurat, operasional unit terhenti)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Deskripsi Kerusakan / Kendala</label>
              <textarea name="description" rows={5} required className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground" placeholder="Ceritakan secara detail bagaimana kerusakan terjadi dan apa gejala/tanda-tandanya..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/dashboard/complaints" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Batal</Link>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 shadow-md">
              <Send className="w-4 h-4" /> Kirim Pengaduan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
