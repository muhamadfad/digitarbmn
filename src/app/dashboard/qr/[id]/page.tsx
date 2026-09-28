import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Printer, Download } from "lucide-react"
import { notFound } from "next/navigation"

export default async function GenerateQRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const asset = await prisma.asset.findUnique({
    where: { id: id },
    include: { category: true }
  })

  if (!asset) return notFound()

  // For scanning purposes, the QR code encodes the NUP.
  // Our scanner reads the NUP and redirects to /dashboard/assets?nup=...
  const qrData = asset.nup
  // Use a reliable free QR generation API for rendering
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/assets/${asset.id}`} className="p-2 bg-card border rounded hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Label QR Code Aset</h1>
          <p className="text-muted-foreground">Cetak label ini dan tempelkan pada fisik BMN</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {/* The Label to Print */}
        <div className="p-12 flex items-center justify-center bg-secondary/30">
          <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-xl shadow-sm text-center w-[350px]">
            <h2 className="text-lg font-bold text-gray-900 mb-1 border-b pb-2">BPS Prov. Sultra</h2>
            <div className="my-4 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt={`QR Code ${asset.nup}`} className="w-48 h-48 rounded" />
            </div>
            <div className="text-gray-900 font-bold text-xl tracking-wider">{asset.nup}</div>
            <div className="text-gray-600 text-sm mt-1 uppercase font-medium line-clamp-1">{asset.name}</div>
            <div className="text-gray-500 text-xs mt-1">{asset.assetCode}</div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-card">
          <a 
            href={qrImageUrl} 
            download={`QR_${asset.nup}.png`} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 border"
          >
            <Download className="w-4 h-4" /> Unduh Gambar QR
          </a>
          <button 
            // In a real app this would trigger a print stylesheet or window.print()
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <Printer className="w-4 h-4" /> Cetak Label (Print)
          </button>
        </div>
      </div>
    </div>
  )
}
