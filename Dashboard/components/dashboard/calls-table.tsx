"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Play, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Datos de ejemplo para la tabla de llamadas
const callsData = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "Juan Pérez",
    date: "2023-04-28T10:30:00",
    duration: "00:08:45",
    hasConflict: true,
    transcript: "Cliente: Llevo esperando una solución más de un mes...\nAgente: Entiendo su frustración, pero...",
    audioUrl: "/placeholder.mp3",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "María López",
    date: "2023-04-28T11:15:00",
    duration: "00:05:22",
    hasConflict: false,
    transcript: "Cliente: Necesito información sobre mi pedido...\nAgente: Con gusto le ayudo...",
    audioUrl: "/placeholder.mp3",
  },
  {
    id: "3",
    employeeId: "3",
    employeeName: "Carlos Rodríguez",
    date: "2023-04-28T12:05:00",
    duration: "00:10:18",
    hasConflict: true,
    transcript:
      "Cliente: Este es el colmo, quiero hablar con un supervisor...\nAgente: Por favor, permítame resolver su problema...",
    audioUrl: "/placeholder.mp3",
  },
  {
    id: "4",
    employeeId: "1",
    employeeName: "Juan Pérez",
    date: "2023-04-28T13:45:00",
    duration: "00:04:30",
    hasConflict: false,
    transcript: "Cliente: Gracias por la información...\nAgente: Un placer ayudarle...",
    audioUrl: "/placeholder.mp3",
  },
  {
    id: "5",
    employeeId: "2",
    employeeName: "María López",
    date: "2023-04-28T14:20:00",
    duration: "00:07:15",
    hasConflict: false,
    transcript: "Cliente: ¿Cuándo llegará mi pedido?...\nAgente: Según nuestro sistema, llegará mañana...",
    audioUrl: "/placeholder.mp3",
  },
]

export function CallsTable() {
  const [selectedCall, setSelectedCall] = useState<(typeof callsData)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleViewTranscript = (call: (typeof callsData)[0]) => {
    setSelectedCall(call)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Análisis</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callsData.map((call) => (
              <TableRow key={call.id}>
                <TableCell className="font-medium">{call.employeeName}</TableCell>
                <TableCell>{formatDate(call.date)}</TableCell>
                <TableCell>{call.duration}</TableCell>
                <TableCell>
                  {call.hasConflict ? (
                    <Badge variant="destructive">Conflicto</Badge>
                  ) : (
                    <Badge variant="outline">Normal</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleViewTranscript(call)}>
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Ver transcripción</span>
                    </Button>
                    <Button variant="outline" size="icon">
                      <Play className="h-4 w-4" />
                      <span className="sr-only">Reproducir audio</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transcripción de Llamada</DialogTitle>
            <DialogDescription>
              {selectedCall && (
                <span>
                  {selectedCall.employeeName} - {formatDate(selectedCall.date)} - Duración: {selectedCall.duration}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">{selectedCall?.transcript}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
