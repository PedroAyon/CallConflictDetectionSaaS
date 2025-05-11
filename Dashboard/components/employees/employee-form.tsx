"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Employee } from "./employee-management"

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (employee: any) => void
}

export function EmployeeForm({ employee, onSubmit }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    gender: employee?.gender || "",
    age: employee?.age || "",
    username: employee?.username || "",
    password: employee?.password || "",
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
    if (!formData.firstName || !formData.lastName || !formData.gender || !formData.username || !formData.password) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    // Convertir edad a número
    const ageNumber = Number.parseInt(formData.age as string)
    if (isNaN(ageNumber) || ageNumber <= 0) {
      alert("Por favor ingresa una edad válida")
      return
    }

    // Enviar datos
    onSubmit({
      ...formData,
      age: ageNumber,
      id: employee?.id,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)} required>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Femenino">Femenino</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Edad</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            min={18}
            max={100}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="text" value={formData.password} onChange={handleChange} required />
      </div>

      <Button type="submit" className="w-full">
        {employee ? "Actualizar Empleado" : "Agregar Empleado"}
      </Button>
    </form>
  )
}
