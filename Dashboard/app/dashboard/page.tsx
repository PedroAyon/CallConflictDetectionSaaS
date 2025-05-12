"use client"

import "react-day-picker/style.css";
import { useEffect, useState } from "react"
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "date-fns"
import { es } from "date-fns/locale"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics"
import type { DateRange } from "react-day-picker"

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

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [timeFilter, setTimeFilter] = useState<string>("today")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    // determine start/end based on timeFilter or custom dateRange
    let start: Date
    let end: Date = new Date()

    switch (timeFilter) {
      case "today":
        start = startOfDay(new Date())
        break
      case "week":
        start = startOfWeek(new Date(), { locale: es })
        break
      case "month":
        start = startOfMonth(new Date())
        break
      case "year":
        start = startOfYear(new Date())
        break
      case "all":
        start = new Date(0)
        break
      case "custom":
        start = dateRange?.from ? startOfDay(dateRange.from) : startOfDay(new Date())
        end = dateRange?.to ? endOfDay(dateRange.to) : endOfDay(new Date())
        break
      default:
        start = startOfDay(new Date())
    }

    const filters: any = {
      start_time: format(start, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      end_time: format(end, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    }
    if (selectedEmployeeId != null) {
      filters.employee_id = selectedEmployeeId
    }

    fetchAllDashboardData("", filters)
  }, [
    fetchAllDashboardData,
    selectedEmployeeId,
    timeFilter,
    dateRange,
  ])

  if (isLoading) return <div>Cargando métricas…</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!company || !stats) return <div>No hay datos disponibles</div>

  // filter employees for metrics
  const filteredEmployees =
    selectedEmployeeId != null
      ? employees.filter((e) => e.employee_id === selectedEmployeeId)
      : employees

  return (
    <div className="space-y-6">
      <DashboardHeader
        companyName={company.company_name}
        subscriptionExpiration={company.subscription_expiration}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeChange={setSelectedEmployeeId}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <DashboardMetrics
        stats={stats}
        employees={filteredEmployees}
        callRecords={callRecords}
      />
    </div>
  )
}
