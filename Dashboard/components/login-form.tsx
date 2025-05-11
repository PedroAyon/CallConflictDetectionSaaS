"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si ya hay una sesión activa al cargar el componente
  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        // Verificar si la sesión es válida (puedes añadir más validaciones como expiración)
        if (sessionData.isAuthenticated) {
          router.push("/dashboard")
        }
      } catch (e) {
        // Si hay un error al parsear, eliminar la sesión corrupta
        localStorage.removeItem("userSession")
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validación básica
      if (!email.trim() || !password.trim()) {
        throw new Error("Por favor, completa todos los campos")
      }

      // Hacer la petición a la API
      const response = await fetch(
        `https://direct-kodiak-grateful.ngrok-free.app/login?user=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "skip-browser-warning",
          },
        },
      )

      if (!response.ok) {
        // Si la respuesta no es exitosa, lanzar un error
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Error al iniciar sesión. Por favor, verifica tus credenciales.")
      }

      // Obtener los datos de la respuesta
      const data = await response.json()

      // Guardar la sesión en localStorage
      localStorage.setItem(
        "userSession",
        JSON.stringify({
          user: email,
          token: data.token || "default-token",
          isAuthenticated: true,
          timestamp: new Date().toISOString(),
        }),
      )

      // Redirigir al dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Error de inicio de sesión:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar sesión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="text"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">¿Olvidaste tu contraseña? Contacta al administrador</p>
      </CardFooter>
    </Card>
  )
}
