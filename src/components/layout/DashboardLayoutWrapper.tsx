"use client"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import MobileBottomNav from "./MobileBottomNav"

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  // Efek untuk mendengarkan tombol Ctrl+B (FASIH Sidebar Toggle Shortcut)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault() // Mencegah bookmark drawer browser
        setDesktopCollapsed(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-white">
      {/* Mobile Sidebar Overlay (hanya muncul jika hamburger diklik untuk menu ekstra) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar / Mobile Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${desktopCollapsed ? "md:w-20" : "md:w-64"} w-64`}
      >
        <Sidebar 
          onMobileItemClick={() => setSidebarOpen(false)} 
          isCollapsed={desktopCollapsed}
          onToggleCollapse={() => setDesktopCollapsed(!desktopCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          onDesktopToggle={() => setDesktopCollapsed(!desktopCollapsed)}
          isDesktopCollapsed={desktopCollapsed}
        />
        {/* Tambahkan pb-16 (padding bottom) khusus di mobile agar konten tidak tertutup Bottom Nav */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Tampilan Khusus Android / Mobile: Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  )
}
