"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"

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

  // track which employee is selected (null = all)
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<number | null>(null)

  // whenever filters change, re-fetch
  useEffect(() => {
    const filters: any = {
      start_time: format(
        new Date().setHours(0, 0, 0, 0),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
      end_time: format(
        new Date(),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      ),
    }
    if (selectedEmployeeId != null) {
      filters.employee_id = selectedEmployeeId
    }
    console.log("Fetching dashboard data with filters:", filters)
    fetchAllDashboardData("", filters)
  }, [fetchAllDashboardData, selectedEmployeeId])

  if (isLoading) return <div>Cargando métricas…</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!company || !stats) return <div>No hay datos disponibles</div>

  // If an employee is selected, only keep that one in the metrics;
  // otherwise show all.
  const filteredEmployees =
    selectedEmployeeId != null
      ? employees.filter((e) => e.employee_id === selectedEmployeeId)
      : employees

  return (
    <div className="space-y-6">
      <DashboardHeader
        companyName={company.company_name}
        subscriptionExpiration={company.subscription_expiration}
        employees={employees}              // full list for dropdown
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeChange={setSelectedEmployeeId}
      />
      <DashboardMetrics
        stats={stats}
        employees={filteredEmployees}      // filtered list for charts/table
        callRecords={callRecords}
      />
    </div>
  )
}
