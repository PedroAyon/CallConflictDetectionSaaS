"use client"

import { useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import { log } from "node:console"

export default function DashboardPage() {
  const {
    company,
    employees,
    callRecords,
    stats,
    isLoading,
    error,
    fetchAllDashboardData,
  } = useDashboardData()

  useEffect(() => {
    const defaultFilters = {
      start_time: format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    }
    fetchAllDashboardData("", defaultFilters)
  }, [fetchAllDashboardData])

  if (isLoading) {
    return <div>Cargando métricas...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!company || !stats) {
    return <div>No hay datos disponibles</div>
  }

  console.log("Company data:", company);
    console.log("Stats data:", stats);
    console.log("Employees data:", employees);
    console.log("Call records data:", callRecords);
  

  return (
    <div className="space-y-6">
      <DashboardHeader
        companyName={company.company_name}
        subscriptionExpiration={company.subscription_expiration}
      />
      <DashboardMetrics
        stats={stats}
        employees={employees}
        callRecords={callRecords}
        // getCallRecording={getCallRecording}
      />
    </div>
  )
}
