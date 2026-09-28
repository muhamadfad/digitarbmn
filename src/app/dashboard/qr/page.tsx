"use client"

import { useState } from "react"
import { ScanLine, Camera, CameraOff } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { useRouter } from "next/navigation"

export default function QRPage() {
  const [nup, setNup] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedValue = result[0].rawValue;
      router.push(`/dashboard/qr/result?code=${scannedValue}`)
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6 sm:p-10 max-w-2xl mx-auto mt-4 sm:mt-8">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <ScanLine className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Scan QR Code BMN</h1>
        <p className="text-sm text-muted-foreground mt-2">Arahkan kamera ke QR Code aset atau masukkan NUP secara manual.</p>
      </div>

      <div className="space-y-8">
        <div className="aspect-square max-w-sm mx-auto bg-secondary/50 rounded-xl border-4 border-dashed border-border flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          {isScanning ? (
            <div className="w-full h-full absolute inset-0">
              <Scanner 
                onScan={handleScan}
                onError={(err) => console.log(err)}
                components={{
                  audio: false,
                  finder: false, // Turn off built in finder to use our own styles
                }}
              />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse z-10 pointer-events-none"></div>
              
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md flex items-center gap-2 transition-colors z-20"
              >
                <CameraOff className="w-4 h-4" /> Matikan Kamera
              </button>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <Camera className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <button 
                onClick={() => setIsScanning(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
              >
                Aktifkan Kamera
              </button>
              <p className="text-xs text-muted-foreground mt-4">Peringatan: Pastikan Anda memberikan izin akses kamera ke browser.</p>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Atau cari manual</span>
          </div>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault()
            if (nup) router.push(`/dashboard/qr/result?code=${nup}`)
          }}
          className="flex gap-3 max-w-sm mx-auto"
        >
          <input
            type="text"
            placeholder="Masukkan NUP (Misal: 10001)"
            className="flex-1 rounded-md border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={nup}
            onChange={(e) => setNup(e.target.value)}
          />
          <button 
            type="submit"
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Cari
          </button>
        </form>
      </div>
    </div>
  )
}
