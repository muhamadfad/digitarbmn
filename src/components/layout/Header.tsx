"use client"

import { signOut, useSession } from "next-auth/react"
import { PanelLeftClose, PanelLeft, Bell, LogOut, User, CheckCircle, AlignLeft } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export default function Header({ 
  onMenuClick,
  onDesktopToggle,
  isDesktopCollapsed
}: { 
  onMenuClick?: () => void
  onDesktopToggle?: () => void
  isDesktopCollapsed?: boolean
}) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const prevIdsRef = useRef<Set<string>>(new Set())

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    // Minta izin Web Notification saat komponen pertama kali dimuat
    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data: Notification[] = await res.json()
        
        // Cek notifikasi baru untuk Push Notification Browser
        if (prevIdsRef.current.size > 0 && typeof window !== 'undefined' && "Notification" in window) {
          const newNotifs = data.filter(n => !n.isRead && !prevIdsRef.current.has(n.id))
          
          if (newNotifs.length > 0 && Notification.permission === "granted") {
            newNotifs.forEach(n => {
              new Notification(n.title, {
                body: n.message,
                icon: '/favicon.ico', // Opsional, bisa diganti logo aplikasi jika ada
              })
            })
          }
        }
        
        // Simpan id yang sudah difetch untuk perbandingan berikutnya
        prevIdsRef.current = new Set(data.map(n => n.id))
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setShowDropdown(false)
    } catch (error) {
      console.error("Failed to mark notification as read", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all`, { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("Failed to mark all as read", error)
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm z-10 relative">
      <div className="flex items-center flex-1">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="mr-4 text-slate-500 hover:text-slate-900 md:hidden"
            title="Buka Menu"
          >
            <AlignLeft className="h-6 w-6" />
          </button>
        )}
        
        {/* Desktop Sidebar Toggle */}
        {onDesktopToggle && (
          <button 
            onClick={onDesktopToggle}
            className="mr-4 text-slate-500 hover:text-slate-900 hidden md:flex items-center justify-center p-1.5 rounded-sm hover:bg-slate-100 transition-colors"
            title="Sembunyikan/Tampilkan Menu (Ctrl+B)"
          >
            {isDesktopCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        
        {/* Notifikasi Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f5a623] text-[10px] font-bold text-white border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <>
              {/* Overlay untuk menutup dropdown jika diklik di luar pada mobile */}
              <div 
                className="fixed inset-0 z-40 sm:hidden" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="fixed top-14 right-4 left-4 sm:left-auto sm:absolute sm:right-0 sm:mt-2 sm:w-96 bg-white border border-slate-200 rounded-sm shadow-lg overflow-hidden z-50 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
                <h3 className="font-semibold text-slate-800">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/50' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-semibold ${!notif.isRead ? 'text-slate-900' : 'text-slate-700'}`}>{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {new Date(notif.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2 leading-relaxed">{notif.message}</p>
                        {notif.link && (
                          <Link 
                            href={notif.link} 
                            onClick={() => markAsRead(notif.id)}
                            className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Lihat Detail &rarr;
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
                    <Bell className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="text-sm">Tidak ada notifikasi baru.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{session?.user?.name}</p>
            <p className="text-xs text-slate-500 mt-1">{session?.user?.role?.replace(/_/g, ' ')}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="ml-2 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
