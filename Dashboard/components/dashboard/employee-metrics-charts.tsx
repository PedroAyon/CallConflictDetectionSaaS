"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CallRecord, Employee } from "@/lib/api/apiTypes"

interface EmployeeMetricsChartsProps {
  employees: Employee[]
  callRecords: CallRecord[]
}

export function EmployeeMetricsCharts({
  employees,
  callRecords,
}: EmployeeMetricsChartsProps) {
  // Procesa datos para el gráfico
  const employeeMetrics = employees.map((employee) => {
    const records = callRecords.filter(
      (r) => r.employee_id === employee.employee_id
    )
    const totalCalls = records.length
    const totalDuration = records.reduce(
      (sum, r) => sum + r.call_duration,
      0
    )
    const conflicts = records.filter(
      (r) => r.conflict_value !== null && r.conflict_value! > 0
    )
    const conflictPct =
      totalCalls > 0 ? (conflicts.length / totalCalls) * 100 : 0

    const hours = Math.floor(totalDuration / 3600)
    const remSecs = totalDuration % 3600
    const minutes = Math.floor(remSecs / 60)
    const seconds = remSecs % 60

    return {
      name: `${employee.first_name} ${employee.last_name}`,
      calls: totalCalls,
      totalHours: hours + minutes / 60 + seconds / 3600,
      percentage: conflictPct,
    }
  })

  const sortedMetrics = [...employeeMetrics].sort(
    (a, b) => b.calls - a.calls
  )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Llamadas por Empleado</CardTitle>
          <CardDescription>
            Número total de llamadas realizadas por cada empleado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedMetrics}>
              <XAxis dataKey="name" tick={false} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiempo en Llamada</CardTitle>
          <CardDescription>
            Horas totales en llamada por cada empleado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedMetrics}>
              <XAxis dataKey="name" tick={false} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => {
                  const hrs = Math.floor(value)
                  const rem = Math.round((value - hrs) * 3600)
                  const mins = Math.floor(rem / 60)
                  const secs = rem % 60
                  return `${hrs}h ${mins}m ${secs}s`
                }}
              />
              <Bar dataKey="totalHours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Porcentaje de Conflictos</CardTitle>
          <CardDescription>
            Porcentaje de llamadas conflictivas por empleado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedMetrics}>
              <XAxis dataKey="name" tick={false} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
