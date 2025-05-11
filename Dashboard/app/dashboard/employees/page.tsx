"use client"

import { EmployeeManagement } from "@/components/employees/employee-management"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"

export default function EmployeesPage() {
    const [companyName, setCompanyName] = useState("")

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const company = await api.company.getMyCompanyDetails()
                setCompanyName(company.company_name)
            } catch (error) {
                console.error("Error fetching company details:", error)
                setCompanyName("")
            }
        }

        fetchCompanyDetails()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {companyName ? `Empleados de ${companyName}` : "Empleados"}
                </h1>
                <p className="text-muted-foreground">Administra los empleados de tu call center</p>
            </div>
            <EmployeeManagement />
        </div>
    )
}
