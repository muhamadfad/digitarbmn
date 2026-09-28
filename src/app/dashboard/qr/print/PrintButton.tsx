"use client"
import { Printer } from "lucide-react"

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-blue-600 text-white px-4 py-2 rounded-sm font-semibold shadow-sm hover:bg-blue-700 flex items-center gap-2"
    >
      <Printer className="w-4 h-4" /> Cetak Sekarang
    </button>
  )
}
