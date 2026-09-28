"use client"

import { FileSpreadsheet } from "lucide-react"

interface ExportProps {
  data: any[]
}

export default function ExportExcelButton({ data }: ExportProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diekspor.")
      return
    }

    // 1. Buat Header CSV
    const headers = [
      "Kode Aset",
      "NUP",
      "Nama Aset",
      "Kategori",
      "Merk/Tipe",
      "Kondisi",
      "Status",
      "Harga Perolehan",
      "Tahun",
      "Penanggung Jawab"
    ]

    // 2. Format baris CSV
    const csvRows = data.map(asset => {
      return [
        asset.assetCode,
        asset.nup,
        `"${asset.name}"`, // Quote strings that might have commas
        `"${asset.category?.name || '-'}"`,
        `"${asset.brand || ''} ${asset.type || ''}".trim()`,
        asset.condition,
        asset.status,
        asset.acquisitionValue || 0,
        asset.acquisitionYear || '-',
        `"${asset.user?.name || '-'}"`
      ].join(",")
    })

    // 3. Gabungkan Header dan Baris
    const csvString = [headers.join(","), ...csvRows].join("\n")

    // 4. Trigger Download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Data_BMN_Export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
      title="Ekspor ke CSV/Excel"
    >
      <FileSpreadsheet className="mr-2 h-4 w-4" /> Ekspor Excel
    </button>
  )
}
