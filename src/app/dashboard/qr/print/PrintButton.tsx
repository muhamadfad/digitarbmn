"use client"
import { Printer } from "lucide-react"

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-primary text-white px-4 py-2 rounded-md font-semibold shadow-md hover:bg-primary/90 flex items-center gap-2"
    >
      <Printer className="w-4 h-4" /> Cetak Sekarang
    </button>
  )
}
