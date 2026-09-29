"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QrCode, ArrowLeft, Camera, AlertTriangle, RefreshCcw } from "lucide-react"
import Link from "next/link"
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const router = useRouter()

  const handleDecode = (text: string) => {
    if (!text) return;
    
    setScanResult(text)
    setIsScanning(false)
    
    // Coba parse JSON jika format QR kita adalah JSON
    try {
      const data = JSON.parse(text)
      if (data.id) {
        router.push(`/dashboard/assets/${data.id}`)
        return
      }
    } catch (e) {
      // Jika bukan JSON, mungkin itu ID langsung atau URL
      if (text.includes('/dashboard/assets/')) {
          window.location.href = text
          return
      }
      
      // Coba redirect dengan asumsi itu adalah ID
      router.push(`/dashboard/assets/${text}`)
    }
  }

  const handleRestartScan = () => {
    setScanResult(null)
    setIsScanning(true)
  }

  return (
    <div className="max-w-md mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Scanner BMN
          </h1>
          <p className="text-sm text-slate-500 mt-1">Arahkan kamera ke QR Code Aset</p>
        </div>
        <Link 
          href="/dashboard"
          className="p-2 border border-slate-200 bg-white rounded-md hover:bg-slate-50 text-slate-600 transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden mb-6 relative">
        {isScanning ? (
          <div className="w-full bg-slate-900 rounded-lg overflow-hidden relative" style={{ minHeight: '350px' }}>
            <Scanner 
              onScan={(result) => handleDecode(result[0].rawValue)}
              onError={(error) => console.log(error?.message)}
              components={{
                finder: true,
              }}
              styles={{
                container: { width: '100%', height: '100%' }
              }}
            />
            {/* Border pembidik kustom */}
            <div className="absolute inset-0 pointer-events-none border-[16px] border-white/10 z-10"></div>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">QR Code Terdeteksi!</h3>
            <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded-md break-all border border-slate-100">
              {scanResult}
            </p>
            <p className="text-xs text-slate-400 mb-6 font-medium animate-pulse">
              Mengalihkan ke detail aset...
            </p>
            <button 
              onClick={handleRestartScan}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md shadow-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" /> Scan Ulang
            </button>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-800">Tips Scanning</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Pastikan ruangan cukup terang dan QR Code tidak terhalang. Posisikan QR Code tepat di dalam kotak pembidik.
          </p>
        </div>
      </div>
    </div>
  )
}
