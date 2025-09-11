"use client"

import { CategoryManagement } from "@/components/categories/category-management"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function CategoriesPage() {
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
                    {companyName ? `Categorías de ${companyName}` : "Categorías"}
                </h1>
                <p className="text-muted-foreground">
                    {subscriptionExpiration && (
                        <span className="block mt-1">
                            Suscripción válida hasta: {formatDate(subscriptionExpiration)}
                        </span>
                    )}
                    <b>Administra las categorías para clasificar tus llamadas.</b>
                </p>
            </div>
            <CategoryManagement />
        </div>
    )
}
