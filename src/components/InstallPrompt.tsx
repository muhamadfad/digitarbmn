"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const handler = (e: any) => {
      // Mencegah prompt bawaan browser muncul secara otomatis
      e.preventDefault();
      // Menyimpan event agar bisa dipanggil nanti lewat tombol kita
      setDeferredPrompt(e);
      
      // Tampilkan popup custom kita
      // Cek apakah user sudah pernah menutupnya sebelumnya
      const hasDismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Deteksi jika aplikasi sudah diinstal
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Tampilkan prompt instalasi bawaan browser (setelah user klik tombol kita)
    deferredPrompt.prompt();

    // Tunggu respon user
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Event hanya bisa dipanggil sekali, jadi bersihkan
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Simpan di localStorage agar tidak terus-terusan mengganggu jika user menolak
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <div className="bg-white border rounded-xl shadow-xl p-5 flex flex-col gap-4 animate-in slide-in-from-bottom-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Install Aplikasi</h3>
              <p className="text-sm text-slate-500 mt-1">
                Install Di-GitaR BMN di perangkat Anda agar lebih cepat diakses seperti aplikasi biasa.
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-3 mt-1">
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            Nanti Saja
          </Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleInstallClick}>
            Install Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
