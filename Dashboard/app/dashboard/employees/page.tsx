import type { Metadata } from "next"
import { EmployeeManagement } from "@/components/employees/employee-management"

export const metadata: Metadata = {
    title: "Empleados - Call Center Analytics",
    description: "Administración de empleados del call center",
}

export default function EmployeesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
                <p className="text-muted-foreground">Administra los empleados de tu call center</p>
            </div>
            <EmployeeManagement />
        </div>
    )
}
