"use client"

import React, {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {AlertCircle} from "lucide-react"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {useAuth} from "@/lib/hooks/useAuth"

export default function LoginForm() {
    const router = useRouter()
    const {isLoggedIn, login, isLoading, error} = useAuth()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (isLoggedIn) {
            router.replace("/dashboard")
        }
    }, [isLoggedIn, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Basic validation
            if (!username.trim() || !password.trim()) {
                throw new Error("Por favor, completa todos los campos")
            }

            // Call our auth hook
            await login({username: username, password: password})
            // On success, the useEffect above will redirect
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales para acceder al sistema
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4"/>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="tu_usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                <p className="text-sm text-gray-500">
                    ¿Olvidaste tu contraseña? Contacta a atención al cliente
                </p>
            </CardFooter>
        </Card>
    )
}
