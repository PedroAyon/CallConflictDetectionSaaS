import type { Metadata } from "next"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const metadata: Metadata = {
    title: "Dashboard - Call Center Analytics",
    description: "Métricas de llamadas de servicio al cliente",
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <DashboardHeader />
            <DashboardMetrics />
        </div>
    )
}
