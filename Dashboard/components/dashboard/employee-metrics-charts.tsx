"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { log } from "console"

export function EmployeeMetricsCharts() {
  const { callRecords, employees, isLoading, error, fetchCallRecords, fetchEmployees, fetchCompanyByAdmin } = useDashboardData()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const company = await fetchCompanyByAdmin() // The hook will use the stored token
        if (company?.company_id) {
          const defaultFilters = {
            start_time: format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          }
          await Promise.all([
            fetchEmployees(company.company_id),
            fetchCallRecords(company.company_id, defaultFilters),
          ])
        }
      } catch (error) {
        console.error("Error fetching charts data:", error)
      }
    }

    fetchData()
  }, [fetchCallRecords, fetchEmployees, fetchCompanyByAdmin])

  if (isLoading) {
    return <div>Cargando gráficas...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  // Process data for charts
  const employeeMetrics = employees.map(employee => {
    const employeeCalls = callRecords.filter(record => record.employee_id === employee.employee_id)
    const totalCalls = employeeCalls.length
    const totalDuration = employeeCalls.reduce((sum, record) => sum + record.call_duration, 0)
    const conflictCalls = employeeCalls.filter(record => record.conflict_value !== null && record.conflict_value > 0)
    const conflictPercentage = totalCalls > 0 ? (conflictCalls.length / totalCalls) * 100 : 0

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(totalDuration / 3600)
    const remainingSeconds = totalDuration % 3600
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60

    return {
      name: `${employee.first_name} ${employee.last_name}`,
      calls: totalCalls,
      totalHours: hours + (minutes / 60) + (seconds / 3600), // Total time in decimal hours for the chart
      hours,
      minutes,
      seconds,
      percentage: conflictPercentage,
    }
  })

  // Sort by number of calls for better visualization
  const sortedMetrics = [...employeeMetrics].sort((a, b) => b.calls - a.calls)

  console.log(sortedMetrics);
  

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Llamadas por Empleado</CardTitle>
          <CardDescription>Número total de llamadas realizadas por cada empleado</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedMetrics}>
              <XAxis dataKey="name" tickFormatter={(value) => value.split(" ")[0]} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiempo en Llamada</CardTitle>
          <CardDescription>Horas totales en llamada por cada empleado</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedMetrics}>
              <XAxis dataKey="name" tickFormatter={(value) => value.split(" ")[0]} />
              <YAxis />
              <Tooltip formatter={(value: number) => {
                const hours = Math.floor(value);
                const remainingSeconds = Math.round((value - hours) * 3600);
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                return `${hours}h ${minutes}m ${seconds}s`;
              }} />
              <Bar dataKey="totalHours" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Porcentaje de Conflictos</CardTitle>
          <CardDescription>Porcentaje de llamadas conflictivas por empleado</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedMetrics}>
              <XAxis dataKey="name" tickFormatter={(value) => value.split(" ")[0]} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="percentage" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
