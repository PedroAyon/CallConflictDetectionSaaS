"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Employee, AddEmployeeRequest } from "@/lib/api/apiTypes"

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (employee: AddEmployeeRequest) => void
}

export function EmployeeForm({ employee, onSubmit }: EmployeeFormProps) {
  const [formData, setFormData] = useState<AddEmployeeRequest>({
    username: employee?.username || "",
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    gender: employee?.gender || undefined,
    birthdate: employee?.birthdate || undefined,
    password: "", // La contraseña no se puede pre-llenar por seguridad
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.username || !formData.first_name || !formData.last_name || (!employee && !formData.password)) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    // Enviar datos
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido</Label>
          <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Femenino</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          value={formData.password} 
          onChange={handleChange} 
          required={!employee} 
        />
        {employee && <p className="text-sm text-muted-foreground">Dejar en blanco para mantener la contraseña actual</p>}
      </div>

      <Button type="submit" className="w-full">
        {employee ? "Actualizar Empleado" : "Agregar Empleado"}
      </Button>
    </form>
  )
}
