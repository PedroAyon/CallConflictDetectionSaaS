import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Categorías - Call Center Analytics",
    description: "Administración de categorías de llamadas",
}

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
