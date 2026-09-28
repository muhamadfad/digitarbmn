"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { LayoutDashboard, Box, QrCode, ClipboardCheck, Wrench, Handshake, AlertTriangle } from "lucide-react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  // Default menu for Admin / Pengelola
  let menus = [
    { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    { name: "BMN", href: "/dashboard/assets", icon: Box },
    { name: "Scan QR", href: "/dashboard/qr", icon: QrCode },
    { name: "Cek", href: "/dashboard/assessments", icon: ClipboardCheck },
    { name: "Servis", href: "/dashboard/maintenances", icon: Wrench },
  ]

  // Menu for Employee / Pengguna BMN
  if (role === "PENGGUNA_BMN" || role === "PENANGGUNG_JAWAB_RUANGAN") {
    menus = [
      { name: "Beranda", href: "/dashboard", icon: LayoutDashboard },
      { name: "Scan QR", href: "/dashboard/qr", icon: QrCode },
      { name: "Pinjam", href: "/dashboard/borrowings", icon: Handshake },
      { name: "Cek Fisik", href: "/dashboard/assessments", icon: ClipboardCheck },
      { name: "Lapor", href: "/dashboard/complaints", icon: AlertTriangle },
    ]
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] pb-1">
      <nav className="flex justify-around items-center h-16">
        {menus.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard")
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className={`${isActive ? 'bg-blue-100' : 'bg-transparent'} p-1 rounded-full transition-colors`}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
