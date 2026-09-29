import DashboardLayoutWrapper from "@/components/layout/DashboardLayoutWrapper"
import InstallPrompt from "@/components/InstallPrompt"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayoutWrapper>
      {children}
      <InstallPrompt />
    </DashboardLayoutWrapper>
  )
}
