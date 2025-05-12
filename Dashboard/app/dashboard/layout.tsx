import type { ReactNode } from "react"
import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"

export const metadata: Metadata = {
  title: "Dashboard - Call Center Analytics",
  description: "Métricas de llamadas de servicio al cliente",
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  )
}
