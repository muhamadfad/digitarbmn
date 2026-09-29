"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Asset {
  nup: string
  assetCode: string
  name: string
  brand: string | null
  condition: string
  status: string
  category: { name: string }
  room: { name: string } | null
}

export default function ExportPDFButton({ assets }: { assets: Asset[] }) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF('landscape')

      // Header Laporan
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("BADAN PUSAT STATISTIK SULAWESI TENGGARA", 14, 20)
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text("Laporan Daftar Barang Milik Negara (BMN)", 14, 28)
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 34)

      // Tabel Data
      const tableData = assets.map((asset, index) => [
        index + 1,
        asset.nup,
        asset.assetCode,
        asset.name,
        asset.brand || '-',
        asset.category.name,
        asset.room?.name || '-',
        asset.condition.replace('_', ' '),
        asset.status.replace('_', ' ')
      ])

      autoTable(doc, {
        startY: 42,
        head: [['No', 'NUP', 'Kode Barang', 'Nama Aset', 'Merk/Tipe', 'Kategori', 'Ruangan', 'Kondisi', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], fontSize: 9, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center' },
          7: { halign: 'center' },
          8: { halign: 'center' }
        },
      })

      // Footer / Tanda Tangan
      const finalY = (doc as any).lastAutoTable.finalY || 42
      doc.text("Mengetahui,", 220, finalY + 20)
      doc.text("Kepala Subbagian Umum", 220, finalY + 25)
      doc.text("_______________________", 220, finalY + 50)
      doc.text("NIP. .......................", 220, finalY + 55)

      doc.save(`Laporan_BMN_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error("Gagal mengekspor PDF:", error)
      alert("Terjadi kesalahan saat membuat PDF")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button 
      onClick={handleExportPDF}
      disabled={isExporting}
      className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-md shadow-md transition-colors text-xs font-bold uppercase tracking-wide disabled:opacity-50"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      {isExporting ? 'Mengekspor...' : 'Ekspor PDF'}
    </button>
  )
}
