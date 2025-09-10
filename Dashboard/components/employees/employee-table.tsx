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

// Función para calcular la edad
const calculateAge = (birthdate: string | null | undefined): number | string => {
  if (!birthdate) {
    return "No especificada";
  }
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  return (
      <Table>
        <TableHeader>
          <TableRow>
          <TableHead>Usuario</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Género</TableHead>
          <TableHead>Edad</TableHead>
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
            <TableCell>{calculateAge(employee.birthdate)}</TableCell>
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