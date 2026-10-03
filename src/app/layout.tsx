import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import UpdateNotifier from "@/components/UpdateNotifier";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Di-GitaR BMN",
  description: "Digitalisasi Riwayat Aset Barang Milik Negara",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          window.deferredPWAInstallPrompt = null;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPWAInstallPrompt = e;
            window.dispatchEvent(new Event('pwa-ready'));
          });
        `}} />
      </head>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <AuthProvider>
          <UpdateNotifier />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
