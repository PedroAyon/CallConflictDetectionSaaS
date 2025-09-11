"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AddCategoryRequest } from "@/lib/api/apiTypes"

interface CategoryFormProps {
  onSubmit: (category: AddCategoryRequest) => void
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [formData, setFormData] = useState<AddCategoryRequest>({
    category_name: "",
    category_description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_name) {
      alert("Por favor, introduce un nombre para la categoría.")
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category_name">Nombre de la Categoría</Label>
        <Input 
            id="category_name" 
            name="category_name" 
            value={formData.category_name} 
            onChange={handleChange} 
            required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_description">Descripción (Opcional)</Label>
        <Textarea
          id="category_description"
          name="category_description"
          value={formData.category_description || ""}
          onChange={handleChange}
          placeholder="Describe para qué se usará esta categoría..."
        />
      </div>

      <Button type="submit" className="w-full">
        Agregar Categoría
      </Button>
    </form>
  )
}
