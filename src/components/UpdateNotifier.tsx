"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export default function UpdateNotifier() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);

  useEffect(() => {
    // Fungsi untuk mengecek versi
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" }); 
        if (res.ok) {
          const data = await res.json();
          const serverVersion = data.version;

          setCurrentVersion((prev) => {
            if (prev === null) {
              return serverVersion;
            } else if (serverVersion > prev) {
              setHasUpdate(true);
              return prev; 
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Gagal mengecek update:", error);
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!hasUpdate) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 min-w-[320px] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex-1 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-full">
          <RefreshCw className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-sm text-white">Update Baru Tersedia!</p>
          <p className="text-xs text-slate-300 mt-0.5">Muat ulang untuk versi terbaru.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
        >
          Refresh
        </button>
        <button 
          onClick={() => setHasUpdate(false)}
          className="text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
