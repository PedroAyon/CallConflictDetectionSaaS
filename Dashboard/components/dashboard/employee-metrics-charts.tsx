"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Datos de ejemplo para las gráficas
const employeeCallsData = [
  { name: "Juan Pérez", calls: 320 },
  { name: "María López", calls: 280 },
  { name: "Carlos Rodríguez", calls: 220 },
  { name: "Ana Martínez", calls: 190 },
  { name: "Roberto Gómez", calls: 235 },
]

const employeeTimeData = [
  { name: "Juan Pérez", hours: 28.5 },
  { name: "María López", hours: 25.2 },
  { name: "Carlos Rodríguez", hours: 18.7 },
  { name: "Ana Martínez", hours: 15.3 },
  { name: "Roberto Gómez", hours: 21.8 },
]

const employeeConflictData = [
  { name: "Juan Pérez", percentage: 8.2 },
  { name: "María López", percentage: 12.5 },
  { name: "Carlos Rodríguez", percentage: 15.8 },
  { name: "Ana Martínez", percentage: 7.3 },
  { name: "Roberto Gómez", percentage: 10.1 },
]

export function EmployeeMetricsCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Llamadas por Empleado</CardTitle>
          <CardDescription>Número total de llamadas realizadas por cada empleado</CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeCallsData}>
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
            <BarChart data={employeeTimeData}>
              <XAxis dataKey="name" tickFormatter={(value) => value.split(" ")[0]} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#16a34a" radius={[4, 4, 0, 0]} />
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
            <BarChart data={employeeConflictData}>
              <XAxis dataKey="name" tickFormatter={(value) => value.split(" ")[0]} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percentage" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
