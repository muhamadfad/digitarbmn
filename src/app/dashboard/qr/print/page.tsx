import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"

import PrintButton from "./PrintButton"

export default async function PrintQRPage() {
  const assets = await prisma.asset.findMany({
    where: { qrCode: { not: null } },
    orderBy: { createdAt: 'desc' }
  })

  if (!assets || assets.length === 0) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Tidak ada QR Code yang dapat dicetak.</h1>
      </div>
    )
  }

  return (
    <div id="print-area" className="bg-white min-h-screen print:p-0 p-8">
      {/* Tombol cetak yang hanya muncul di layar, hilang saat diprint */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-md">
        <div>
          <h1 className="font-bold text-slate-800">Cetak Label BMN</h1>
          <p className="text-sm text-slate-500">Gunakan kertas A4 Stiker. Tekan tombol cetak di bawah ini.</p>
        </div>
        <PrintButton />
      </div>

      {/* Area yang akan diprint */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 print:grid-cols-5 print:gap-2 print:max-w-none w-full">
        {assets.map(asset => (
          <div key={asset.id} className="border-2 border-dashed border-slate-300 p-2 text-center flex flex-col items-center justify-center break-inside-avoid">
            <h3 className="text-[9px] font-bold uppercase truncate w-full mb-1">{asset.assetCode}</h3>
            {asset.qrCode ? (
              <img src={asset.qrCode} alt={`QR ${asset.name}`} className="w-20 h-20 print:w-16 print:h-16 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">N/A</div>
            )}
            <p className="text-[10px] font-semibold mt-1 truncate w-full">{asset.nup}</p>
            <p className="text-[8px] text-slate-500 leading-tight line-clamp-2">{asset.name}</p>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  )
}
