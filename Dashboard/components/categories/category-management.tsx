"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import { CategoryTable } from "./category-table"
import { CategoryForm } from "./category-form"
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
import { Category, AddCategoryRequest } from "@/lib/api/apiTypes"
import { useToast } from "@/components/ui/use-toast"

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      const company = await api.company.getMyCompanyDetails()
      const apiCategories = await api.categories.getCategoriesByCompany(company.company_id)
      setCategories(apiCategories)
      setFilteredCategories(apiCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const initialFetch = async () => {
        await fetchCategories();
        setIsLoading(false)
    }
    initialFetch()
  }, [toast])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = categories.filter(
      (category) =>
        category.category_name.toLowerCase().includes(query) ||
        (category.category_description && category.category_description.toLowerCase().includes(query))
    )
    setFilteredCategories(filtered)
  }, [searchQuery, categories])

  const handleAddCategory = async (category: AddCategoryRequest) => {
    try {
      const company = await api.company.getMyCompanyDetails()
      await api.categories.addCategory(company.company_id, category)
      await fetchCategories() // Refetch categories
      setIsAddDialogOpen(false)
      toast({
        title: "Éxito",
        description: "Categoría agregada correctamente",
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar la categoría",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      try {
        const company = await api.company.getMyCompanyDetails()
        await api.categories.deleteCategory(company.company_id, selectedCategory.category_id)
        await fetchCategories() // Refetch categories
        setIsDeleteDialogOpen(false)
        setSelectedCategory(null)
        toast({
          title: "Éxito",
          description: "Categoría eliminada correctamente",
        })
      } catch (error) {
        console.error("Error deleting category:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la categoría",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return <div>Cargando categorías...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Categorías</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Categoría
          </Button>
        </div>
      </div>

      <CategoryTable
        categories={filteredCategories}
        onDelete={(category) => {
          setSelectedCategory(category)
          setIsDeleteDialogOpen(true)
        }}
      />

      {/* Dialog to add category */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Categoría</DialogTitle>
            <DialogDescription>Completa el formulario para agregar una nueva categoría.</DialogDescription>
          </DialogHeader>
          <CategoryForm onSubmit={handleAddCategory} />
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la categoría "{selectedCategory?.category_name}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
