"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { summaryService, SummaryResponse } from "@/lib/api/summaryService"
import ReactMarkdown from "react-markdown"

// This is a placeholder for your actual company ID retrieval logic.
// You'll need to replace this with how your app gets the current user's company ID.
const mockCompanyId = 1 // Replace with your actual company ID source

export function CallSummary() {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const today = format(new Date(), "yyyy-MM-dd")

  // Function to fetch the summary
  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await summaryService.getSummary(mockCompanyId, today)
      setSummary(response.summary)
    } catch (error: any) {
      if (error?.error?.includes("No summary found")) {
        setSummary(null)
      } else {
        console.error("Error fetching summary:", error)
        // Optionally, handle other errors, e.g., show an error message
      }
    } finally {
      setLoading(false)
    }
  }

  // Function to generate/regenerate the summary
  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    try {
      const response = await summaryService.addOrUpdateSummary(mockCompanyId, today)
      setSummary(response.summary)
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Fetch the summary on initial component load
  useEffect(() => {
    fetchSummary()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Resumen de Hoy</CardTitle>
        <Button onClick={handleGenerateSummary} disabled={isGenerating}>
          {isGenerating
            ? "Generando..."
            : summary
            ? "Regenerar resumen"
            : "Obtener resumen"}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <p className="text-sm text-gray-500">Cargando resumen...</p>
        ) : summary ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Aún no se ha generado un resumen para hoy. Haz clic en "Obtener resumen" para crearlo.
          </p>
        )}
      </CardContent>
    </Card>
  )
}