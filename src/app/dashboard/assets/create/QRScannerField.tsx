"use client"

import { useState } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { QrCode, X } from "lucide-react"

export default function QRScannerField() {
  const [qrValue, setQrValue] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedValue = result[0].rawValue;
      setQrValue(scannedValue)
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium text-foreground">Data QR Code Bawaan (Opsional)</label>
      <p className="text-xs text-muted-foreground mb-2">Scan stiker QR Code dari SIMAN/Aplikasi Negara jika ada, agar aset bisa langsung dipindai nantinya.</p>
      
      {!isScanning ? (
        <div className="flex gap-2">
          <input 
            type="text" 
            name="qrCode" 
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
            placeholder="Scan atau ketik kode QR..." 
          />
          <button 
            type="button"
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" /> Scan QR
          </button>
        </div>
      ) : (
        <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-2 bg-slate-50 max-w-sm mx-auto overflow-hidden">
          <button 
            type="button"
            onClick={() => setIsScanning(false)}
            className="absolute top-4 right-4 z-10 bg-white text-slate-900 p-1.5 rounded-full shadow-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-full aspect-square bg-black rounded overflow-hidden">
            <Scanner onScan={handleScan} onError={(err) => console.error(err)} />
          </div>
          <p className="text-xs text-center text-slate-500 mt-3 font-medium">Arahkan kamera ke stiker QR Code BMN</p>
        </div>
      )}
    </div>
  )
}
