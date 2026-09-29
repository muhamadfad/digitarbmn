"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Box, 
  QrCode, 
  Handshake, 
  Car, 
  ClipboardCheck, 
  AlertTriangle, 
  Wrench, 
  BarChart, 
  FileText, 
  Database,
  Users,
  Settings,
  Menu
} from "lucide-react"

export default function Sidebar({ 
  onMobileItemClick, 
  isCollapsed = false,
  onToggleCollapse 
}: { 
  onMobileItemClick?: () => void,
  isCollapsed?: boolean,
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

  const allMenus = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "PENGELOLA_BMN", "PIMPINAN", "PENGGUNA_BMN", "PENANGGUNG_JAWAB_RUANGAN"] },
    { name: "Data BMN", href: "/dashboard/assets", icon: Box, roles: ["ADMIN", "PENGELOLA_BMN", "PIMPINAN"] },
    { name: "Scanner QR", href: "/dashboard/scanner", icon: QrCode, roles: ["ADMIN", "PENGELOLA_BMN", "PENGGUNA_BMN"] },
    { name: "Stock Opname", href: "/dashboard/sensus", icon: ClipboardCheck, roles: ["ADMIN", "PENGELOLA_BMN"] },
    { name: "Peminjaman", href: "/dashboard/borrowings", icon: Handshake, roles: ["ADMIN", "PENGELOLA_BMN", "PIMPINAN", "PENGGUNA_BMN", "PENANGGUNG_JAWAB_RUANGAN"] },
    { name: "Kendaraan", href: "/dashboard/vehicles", icon: Car, roles: ["ADMIN", "PENGELOLA_BMN", "PIMPINAN"] },
    { name: "Assessment", href: "/dashboard/assessments", icon: ClipboardCheck, roles: ["ADMIN", "PENGELOLA_BMN", "PENGGUNA_BMN", "PENANGGUNG_JAWAB_RUANGAN"] },
    { name: "Pengaduan", href: "/dashboard/complaints", icon: AlertTriangle, roles: ["ADMIN", "PENGELOLA_BMN", "PENGGUNA_BMN", "PENANGGUNG_JAWAB_RUANGAN"] },
    { name: "Maintenance", href: "/dashboard/maintenances", icon: Wrench, roles: ["ADMIN", "PENGELOLA_BMN"] },
    { name: "Analisis", href: "/dashboard/analytics", icon: BarChart, roles: ["ADMIN", "PENGELOLA_BMN", "PIMPINAN"] },
    { name: "RKBMN", href: "/dashboard/rkbmn", icon: FileText, roles: ["ADMIN", "PENGELOLA_BMN", "PIMPINAN"] },
  ]

  const menus = allMenus.filter(m => !role || m.roles.includes(role))

  // Optional Admin menus
  const adminMenus = [
    { name: "Master Data", href: "/dashboard/master", icon: Database },
    { name: "Pengguna & Role", href: "/dashboard/users", icon: Users },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ]

  return (
    <div className={`flex h-full flex-col bg-white text-slate-700 shadow-md border-r border-slate-200 z-10 relative transition-all duration-300 w-full`}>
      <div className="flex h-14 items-center border-b border-slate-200 bg-slate-50 justify-center">
        {isCollapsed ? (
          <div className="bg-primary p-1.5 rounded-md shadow-md">
            <Database className="w-5 h-5 text-white" />
          </div>
        ) : (
          <h1 className="font-black tracking-tight text-slate-800 flex items-center gap-2 text-lg w-full px-4">
            <div className="bg-primary p-1.5 rounded-md shadow-md shrink-0">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span>Di-GitaR BMN</span>
          </h1>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4 flex flex-col">
        <nav className="space-y-1 px-3 flex-1">
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </div>
          )}
          {menus.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileItemClick}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center rounded-lg py-2.5 text-sm font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                  isActive 
                    ? "bg-slate-900 text-white shadow-md font-semibold" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className={`h-4 w-4 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}

          {role === "ADMIN" && (
            <>
              <div className={`mt-8 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : 'px-3'}`}>
                {isCollapsed ? 'ADM' : 'Administration'}
              </div>
              {adminMenus.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onMobileItemClick}
                    title={isCollapsed ? item.name : undefined}
                    className={`group flex items-center rounded-lg py-2.5 text-sm font-medium transition-all ${isCollapsed ? 'justify-center px-0' : 'px-3'} ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-md font-semibold" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>
        
        {/* Shortcut Hint di bawah */}
        <div className={`px-4 py-3 mt-auto text-xs text-slate-400 font-mono flex items-center border-t border-slate-100 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span>Sembunyikan</span>}
          <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Ctrl+B</span>
        </div>
      </div>
    </div>
  )
}
