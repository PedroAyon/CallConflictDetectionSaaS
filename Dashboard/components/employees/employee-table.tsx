"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Employee } from "@/lib/api/apiTypes"

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellido</TableHead>
          <TableHead>Género</TableHead>
          <TableHead>Fecha de Nacimiento</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.employee_id}>
            <TableCell>{employee.username}</TableCell>
            <TableCell>{employee.first_name}</TableCell>
            <TableCell>{employee.last_name}</TableCell>
            <TableCell>{employee.gender === "M" ? "Masculino" : employee.gender === "F" ? "Femenino" : "No especificado"}</TableCell>
            <TableCell>{employee.birthdate || "No especificada"}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(employee)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
