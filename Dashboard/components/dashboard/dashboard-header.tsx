"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { Employee } from "@/lib/api/apiTypes"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  companyName: string
  subscriptionExpiration: string
  employees: Employee[]
  selectedEmployeeId: number | null
  onEmployeeChange: (employeeId: number | null) => void
  timeFilter: string
  onTimeFilterChange: (value: string) => void
  dateRange?: DateRange
  onDateRangeChange: (range?: DateRange) => void
}

export function DashboardHeader({
  companyName,
  subscriptionExpiration,
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  timeFilter,
  onTimeFilterChange,
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const selectedName =
    selectedEmployeeId == null
      ? "Todos los empleados"
      : (() => {
          const emp = employees.find(
            (e) => e.employee_id === selectedEmployeeId
          )
          return emp
            ? `${emp.first_name} ${emp.last_name}`
            : "Seleccionar empleado"
        })()

  const formatDateDisplay = (dateString: string) =>
    format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
      locale: es,
    })

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{companyName}</h1>
        {subscriptionExpiration && (
          <p className="text-muted-foreground mt-1">
            Suscripción válida hasta: {formatDateDisplay(subscriptionExpiration)}
          </p>
        )}
        <p className="text-muted-foreground font-semibold mt-1">
          Métricas de llamadas de servicio al cliente
        </p>
      </div>

      <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
        {/* Employee selector */}
        <Popover
          open={employeeSearchOpen}
          onOpenChange={setEmployeeSearchOpen}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={employeeSearchOpen}
              className="w-full justify-between md:w-[220px]"
            >
              {selectedName}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 md:w-[220px]">
            <Command>
              <div className="p-2">
                <CommandInput placeholder="Buscar empleado..." className="h-9" />
              </div>
              <CommandList>
                <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      onEmployeeChange(null)
                      setEmployeeSearchOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEmployeeId == null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Todos los empleados
                  </CommandItem>
                  {employees.map((emp) => (
                    <CommandItem
                      key={emp.employee_id}
                      value={emp.employee_id.toString()}
                      onSelect={() => {
                        onEmployeeChange(emp.employee_id)
                        setEmployeeSearchOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedEmployeeId === emp.employee_id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {emp.first_name} {emp.last_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Time filter */}
        <Select
          value={timeFilter}
          onValueChange={(val) => {
            onTimeFilterChange(val)
            if (val !== "custom") {
              onDateRangeChange(undefined)
            }
          }}
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

        {/* Custom date range */}
        {timeFilter === "custom" && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal md:w-[280px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: es })
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
                onSelect={onDateRangeChange}
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
