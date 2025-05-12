"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  companyName: string
  subscriptionExpiration: string
}

export function DashboardHeader({
  companyName,
  subscriptionExpiration,
}: DashboardHeaderProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [timeFilter, setTimeFilter] = useState("today")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
        locale: es,
      })
    } catch {
      return dateString
    }
  }

  // Temporal: lista estática mientras se implementa el filtrado real
  const employees = [
    { id: "1", name: "Juan Pérez" },
    { id: "2", name: "María López" },
    { id: "3", name: "Carlos Rodríguez" },
    { id: "4", name: "Ana Martínez" },
    { id: "5", name: "Roberto Gómez" },
    { id: "6", name: "Laura Sánchez" },
    { id: "7", name: "Miguel Fernández" },
    { id: "8", name: "Sofía Ramírez" },
    { id: "9", name: "Javier Torres" },
    { id: "10", name: "Carmen Díaz" },
  ]

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {companyName}
        </h1>
        <p className="text-muted-foreground">
          {subscriptionExpiration && (
            <span className="block mt-1">
              Suscripción válida hasta: {formatDate(subscriptionExpiration)}
            </span>
          )}
          <b>Métricas de llamadas de servicio al cliente</b>
        </p>
      </div>
      <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
        {/* Empleado */}
        <Popover
          open={employeeSearchOpen}
          onOpenChange={setEmployeeSearchOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={employeeSearchOpen}
              className="w-full justify-between md:w-[220px]"
            >
              {selectedEmployee === "all"
                ? "Todos los empleados"
                : employees.find(
                    (e) => e.id === selectedEmployee
                  )?.name ?? "Seleccionar empleado"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 md:w-[220px]">
            <Command>
              <CommandInput
                placeholder="Buscar empleado..."
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>
                  No se encontraron empleados.
                </CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setSelectedEmployee("all")
                      setEmployeeSearchOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEmployee === "all"
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    Todos los empleados
                  </CommandItem>
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={employee.name}
                      onSelect={() => {
                        setSelectedEmployee(employee.id)
                        setEmployeeSearchOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedEmployee === employee.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {employee.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Periodo */}
        <Select
          value={timeFilter}
          onValueChange={setTimeFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Periodo de tiempo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="year">Este año</SelectItem>
            <SelectItem value="all">Desde siempre</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {/* Rango personalizado */}
        {timeFilter === "custom" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal md:w-[280px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(
                        dateRange.from,
                        "dd/MM/yyyy",
                        { locale: es }
                      )}{" "}
                      -{" "}
                      {format(
                        dateRange.to,
                        "dd/MM/yyyy",
                        { locale: es }
                      )}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", {
                      locale: es,
                    })
                  )
                ) : (
                  <span>Seleccionar fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
)
}
