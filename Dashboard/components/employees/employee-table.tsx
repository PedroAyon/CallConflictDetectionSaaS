"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import type { Employee } from "./employee-management"

interface EmployeeTableProps {
  employees: Employee[]
  passwordVisibility: Record<string, boolean>
  onTogglePasswordVisibility: (employeeId: string) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

export function EmployeeTable({
  employees,
  passwordVisibility,
  onTogglePasswordVisibility,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Contraseña</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.id}</TableCell>
              <TableCell>{employee.firstName}</TableCell>
              <TableCell>{employee.lastName}</TableCell>
              <TableCell>{employee.gender}</TableCell>
              <TableCell>{employee.age}</TableCell>
              <TableCell>{employee.username}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{passwordVisibility[employee.id] ? employee.password : "••••••••"}</span>
                  <Button variant="ghost" size="icon" onClick={() => onTogglePasswordVisibility(employee.id)}>
                    {passwordVisibility[employee.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                      {passwordVisibility[employee.id] ? "Ocultar contraseña" : "Ver contraseña"}
                    </span>
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(employee)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(employee)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
