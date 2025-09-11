"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Category } from "@/lib/api/apiTypes"

interface CategoryTableProps {
  categories: Category[]
  onDelete: (category: Category) => void
}

export function CategoryTable({ categories, onDelete }: CategoryTableProps) {
  return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Nombre de Categoría</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
          <TableRow key={category.category_id}>
            <TableCell className="font-medium">{category.category_name}</TableCell>
            <TableCell>{category.category_description || <span className="text-muted-foreground">Sin descripción</span>}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onDelete(category)}>
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
