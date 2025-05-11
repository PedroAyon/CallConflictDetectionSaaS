"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CallsTable } from "@/components/dashboard/calls-table"
import { EmployeeMetricsCharts } from "@/components/dashboard/employee-metrics-charts"

export function DashboardMetrics() {
  // Datos de ejemplo (en una implementación real, estos vendrían de una API)
  const metrics = {
    totalCalls: 1245,
    totalCallTime: "98:30:15", // formato HH:MM:SS
    conflictPercentage: 12.5,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Llamadas Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo en Llamada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCallTime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porcentaje de Conflictos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conflictPercentage}%</div>
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
