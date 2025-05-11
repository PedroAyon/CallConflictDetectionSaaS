import type React from "react"
import {Sidebar} from "@/components/sidebar"

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar/>
            <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
        </div>
    )
}
