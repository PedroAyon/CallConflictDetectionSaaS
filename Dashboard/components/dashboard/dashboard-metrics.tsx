"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallsTable } from "@/components/dashboard/calls-table"
import { EmployeeMetricsCharts } from "@/components/dashboard/employee-metrics-charts"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function DashboardMetrics() {
  const { stats, isLoading, error, fetchCallRecordStats, fetchCompanyByAdmin } = useDashboardData()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const company = await fetchCompanyByAdmin() // The hook will use the stored token
        if (company?.company_id) {
          const defaultFilters = {
            start_time: format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          }
          await fetchCallRecordStats(company.company_id, defaultFilters)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchData()
  }, [fetchCallRecordStats, fetchCompanyByAdmin])

  if (isLoading) {
    return <div>Cargando métricas...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!stats) {
    return <div>No hay datos disponibles</div>
  }

  // Format total call time from seconds to HH:MM:SS
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Llamadas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_calls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo en Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTotalTime(stats.total_duration_seconds)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porcentaje de Conflictos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conflict_percentage.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Gráficas</TabsTrigger>
          <TabsTrigger value="calls">Registro de Llamadas</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="space-y-4">
          <EmployeeMetricsCharts />
        </TabsContent>
        <TabsContent value="calls">
          <CallsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
