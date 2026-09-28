import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

export default async function CreateMasterDataPage({
  params
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params

  // Validate type
  if (!['category', 'location', 'room'].includes(type)) {
    redirect('/dashboard/master')
  }

  const title = type === 'category' ? 'Kategori Aset' : type === 'location' ? 'Lokasi / Gedung' : 'Ruangan'
  
  // Need to fetch locations if we are creating a room
  let locations: any[] = []
  if (type === 'room') {
    locations = await prisma.location.findMany({ orderBy: { name: 'asc' } })
  }

  async function createMasterData(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const code = formData.get('code') as string

    if (!name || !code) return

    if (type === 'category') {
      await prisma.category.create({ data: { name, code } })
    } else if (type === 'location') {
      await prisma.location.create({ data: { name, code } })
    } else if (type === 'room') {
      const locationId = formData.get('locationId') as string
      if (!locationId) return
      await prisma.room.create({ data: { name, code, locationId } })
    }

    redirect(`/dashboard/master?tab=${type}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/master?tab=${type}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Tambah {title}</h1>
          <p className="text-sm text-slate-500">Masukkan detail {title.toLowerCase()} baru ke dalam sistem.</p>
        </div>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-6">
        <form action={createMasterData} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-1">Kode {title} <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                id="code" 
                name="code" 
                required
                placeholder={`Contoh: ${type === 'category' ? 'ELK' : type === 'location' ? 'GDG-A' : 'R-101'}`}
                className="w-full rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Nama {title} <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                placeholder={`Contoh: ${type === 'category' ? 'Elektronik & IT' : type === 'location' ? 'Gedung Utama' : 'Ruang Server'}`}
                className="w-full rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {type === 'room' && (
              <div>
                <label htmlFor="locationId" className="block text-sm font-semibold text-slate-700 mb-1">Lokasi Gedung <span className="text-rose-500">*</span></label>
                <select 
                  id="locationId" 
                  name="locationId" 
                  required
                  className="w-full rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Link href={`/dashboard/master?tab=${type}`} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-sm transition-colors border border-transparent">
              Batal
            </Link>
            <button type="submit" className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors shadow-sm">
              <Save className="w-4 h-4 mr-2" /> Simpan {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
