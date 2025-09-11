"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Users, BarChart3, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/lib/hooks/useAuth"

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Empleados",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    name: "Categorías",
    href: "/dashboard/categories",
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    // Redirect to login page
    router.replace("/")
  }

  return (
      <>
        {/* Mobile sidebar toggle */}
        <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Sidebar for mobile and desktop */}
        <div
            className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
            )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <h1 className="text-xl font-bold">Call Center Analytics</h1>
            </div>

            <nav className="flex-1 space-y-1 px-2 py-4">
              {navItems.map((item) => (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                          pathname === item.href
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
              ))}
            </nav>

            <div className="border-t p-4">
              <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </>
  )
}
