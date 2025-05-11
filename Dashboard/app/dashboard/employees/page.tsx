"use client"

import { EmployeeManagement } from "@/components/employees/employee-management"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EmployeesPage() {
    const [companyName, setCompanyName] = useState("")
    const [subscriptionExpiration, setSubscriptionExpiration] = useState<string>("")

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const company = await api.company.getMyCompanyDetails()
                setCompanyName(company.company_name)
                setSubscriptionExpiration(company.subscription_expiration)
            } catch (error) {
                console.error("Error fetching company details:", error)
                setCompanyName("")
                setSubscriptionExpiration("")
            }
        }

        fetchCompanyDetails()
    }, [])

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es })
        } catch (error) {
            return dateString
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    {companyName ? `Empleados de ${companyName}` : "Empleados"}
                </h1>
                <p className="text-muted-foreground">
                    {subscriptionExpiration && (
                        <span className="block mt-1">
                            Suscripción válida hasta: {formatDate(subscriptionExpiration)}
                        </span>
                    )}
                    <b>Administra los empleados de tu call center</b>
                </p>
            </div>
            <EmployeeManagement />
        </div>
    )
}
