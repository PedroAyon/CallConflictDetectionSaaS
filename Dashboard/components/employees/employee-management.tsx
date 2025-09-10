"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Employee, AddEmployeeRequest } from "@/lib/api/apiTypes"
import { useToast } from "@/components/ui/use-toast"

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const company = await api.company.getMyCompanyDetails()
        const apiEmployees = await api.employees.getEmployeesByCompany(company.company_id)
        setEmployees(apiEmployees)
        setFilteredEmployees(apiEmployees)
      } catch (error) {
        console.error("Error fetching employees:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los empleados",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [toast])

  // Filter employees based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = employees.filter(
      (employee) =>
        employee.first_name.toLowerCase().includes(query) ||
        employee.last_name.toLowerCase().includes(query) ||
        employee.username.toLowerCase().includes(query)
    )
    setFilteredEmployees(filtered)
  }, [searchQuery, employees])

  const handleAddEmployee = async (employee: AddEmployeeRequest) => {
    try {
      const company = await api.company.getMyCompanyDetails()
      await api.employees.addEmployee(company.company_id, employee)
      
      // Refetch employees to get the updated list
      const apiEmployees = await api.employees.getEmployeesByCompany(company.company_id)
      setEmployees(apiEmployees)
      
    setIsAddDialogOpen(false)
      toast({
        title: "Éxito",
        description: "Empleado agregado correctamente",
      })
    } catch (error) {
      console.error("Error adding employee:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el empleado",
        variant: "destructive",
      })
    }
  }

  const handleEditEmployee = async (employee: AddEmployeeRequest) => {
    if (!selectedEmployee) return;
    
    try {
      await api.employees.updateEmployee(selectedEmployee.employee_id, employee)
      
      // Refetch employees to get the updated list
      const company = await api.company.getMyCompanyDetails()
      const apiEmployees = await api.employees.getEmployeesByCompany(company.company_id)
      setEmployees(apiEmployees)
      
    setIsEditDialogOpen(false)
    setSelectedEmployee(null)
      toast({
        title: "Éxito",
        description: "Empleado actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEmployee = async () => {
    if (selectedEmployee) {
      try {
        await api.employees.deleteEmployee(selectedEmployee.employee_id)
        
        // Refetch employees to get the updated list
        const company = await api.company.getMyCompanyDetails()
        const apiEmployees = await api.employees.getEmployeesByCompany(company.company_id)
        setEmployees(apiEmployees)
        
      setIsDeleteDialogOpen(false)
      setSelectedEmployee(null)
        toast({
          title: "Éxito",
          description: "Empleado eliminado correctamente",
        })
      } catch (error) {
        console.error("Error deleting employee:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el empleado",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <div>Cargando empleados...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Empleados</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido o usuario..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Empleado
        </Button>
        </div>
      </div>

      <EmployeeTable
        employees={filteredEmployees}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente al empleado {selectedEmployee?.first_name}{" "}
              {selectedEmployee?.last_name} del sistema.
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
