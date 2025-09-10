"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallsTable } from "@/components/dashboard/calls-table"
import { EmployeeMetricsCharts } from "@/components/dashboard/employee-metrics-charts"
import { format } from "date-fns"
import { CallRecord, CallRecordStatsResponse, Employee } from "@/lib/api/apiTypes"

interface DashboardMetricsProps {
  stats: CallRecordStatsResponse
  employees: Employee[]
  callRecords: CallRecord[]
}

export function DashboardMetrics({
  stats,
  employees,
  callRecords,
}: DashboardMetricsProps) {
  // Formatea segundos a HH:MM:SS
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Llamadas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_calls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo en Llamada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTotalTime(stats.total_duration_seconds)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Porcentaje de Conflictos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.conflict_percentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* If more than one employee, show tabs with charts and table.
          Otherwise, only show the calls table */}
      {employees.length > 1 ? (
        <Tabs defaultValue="charts">
          <TabsList>
            <TabsTrigger value="charts">Gráficas</TabsTrigger>
            <TabsTrigger value="calls">Registro de Llamadas</TabsTrigger>
          </TabsList>
          <TabsContent value="charts" className="space-y-4">
            <EmployeeMetricsCharts
              employees={employees}
              callRecords={callRecords}
            />
          </TabsContent>
          <TabsContent value="calls">
            <CallsTable callRecords={callRecords} />
          </TabsContent>
        </Tabs>
      ) : (
        <div>
          <CallsTable callRecords={callRecords} />
        </div>
      )}
    </div>
  )
}
