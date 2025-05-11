"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { EmployeeTable } from "@/components/employees/employee-table"
import { EmployeeForm } from "@/components/employees/employee-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Tipo para los empleados
export type Employee = {
  id: string
  firstName: string
  lastName: string
  gender: string
  age: number
  username: string
  password: string
}

// Datos de ejemplo
const initialEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Juan",
    lastName: "Pérez",
    gender: "Masculino",
    age: 32,
    username: "juan.perez",
    password: "password123",
  },
  {
    id: "2",
    firstName: "María",
    lastName: "López",
    gender: "Femenino",
    age: 28,
    username: "maria.lopez",
    password: "securepass456",
  },
  {
    id: "3",
    firstName: "Carlos",
    lastName: "Rodríguez",
    gender: "Masculino",
    age: 35,
    username: "carlos.rodriguez",
    password: "callcenter789",
  },
  {
    id: "4",
    firstName: "Ana",
    lastName: "Martínez",
    gender: "Femenino",
    age: 30,
    username: "ana.martinez",
    password: "ana2023",
  },
  {
    id: "5",
    firstName: "Roberto",
    lastName: "Gómez",
    gender: "Masculino",
    age: 42,
    username: "roberto.gomez",
    password: "roberto123",
  },
]

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({})

  const handleAddEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: (employees.length + 1).toString(),
    }
    setEmployees([...employees, newEmployee])
    setIsAddDialogOpen(false)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEmployees(employees.map((emp) => (emp.id === employee.id ? employee : emp)))
    setIsEditDialogOpen(false)
    setSelectedEmployee(null)
  }

  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id))
      setIsDeleteDialogOpen(false)
      setSelectedEmployee(null)
    }
  }

  const togglePasswordVisibility = (employeeId: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Lista de Empleados</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Empleado
        </Button>
      </div>

      <EmployeeTable
        employees={employees}
        passwordVisibility={passwordVisibility}
        onTogglePasswordVisibility={togglePasswordVisibility}
        onEdit={(employee) => {
          setSelectedEmployee(employee)
          setIsEditDialogOpen(true)
        }}
        onDelete={(employee) => {
          setSelectedEmployee(employee)
          setIsDeleteDialogOpen(true)
        }}
      />

      {/* Diálogo para agregar empleado */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Empleado</DialogTitle>
            <DialogDescription>Completa el formulario para agregar un nuevo empleado.</DialogDescription>
          </DialogHeader>
          <EmployeeForm onSubmit={handleAddEmployee} />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar empleado */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>Actualiza la información del empleado.</DialogDescription>
          </DialogHeader>
          {selectedEmployee && <EmployeeForm employee={selectedEmployee} onSubmit={handleEditEmployee} />}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al empleado {selectedEmployee?.firstName}{" "}
              {selectedEmployee?.lastName} del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
