"use client"

import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { approveBorrowing, rejectBorrowing } from "@/app/actions/borrowingActions"
import { useRouter } from "next/navigation"

export default function BorrowingActionButtons({ borrowingId, status, userRole }: { borrowingId: string, status: string, userRole: string }) {
  const [isPendingApprove, setIsPendingApprove] = useState(false)
  const [isPendingReject, setIsPendingReject] = useState(false)
  const router = useRouter()

  const isAdmin = userRole === 'ADMIN' || userRole === 'PENGELOLA_BMN'

  if (!isAdmin || status !== 'MENUNGGU_PERSETUJUAN') {
    return null
  }

  const handleApprove = async () => {
    setIsPendingApprove(true)
    try {
      await approveBorrowing(borrowingId)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setIsPendingApprove(false)
    }
  }

  const handleReject = async () => {
    if (!confirm("Apakah Anda yakin ingin menolak permohonan ini?")) return
    setIsPendingReject(true)
    try {
      await rejectBorrowing(borrowingId)
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setIsPendingReject(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={handleApprove}
        disabled={isPendingApprove || isPendingReject}
        className="p-1 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-md transition-colors disabled:opacity-50"
        title="Setujui"
      >
        {isPendingApprove ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button 
        onClick={handleReject}
        disabled={isPendingApprove || isPendingReject}
        className="p-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md transition-colors disabled:opacity-50"
        title="Tolak"
      >
        {isPendingReject ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
      </button>
    </div>
  )
}
