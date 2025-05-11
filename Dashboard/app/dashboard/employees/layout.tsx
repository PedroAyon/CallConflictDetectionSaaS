import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Empleados - Call Center Analytics",
    description: "Administración de empleados del call center",
}

export default function EmployeesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}