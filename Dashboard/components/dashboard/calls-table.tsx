"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FileText,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CallRecord } from "@/lib/api/apiTypes"
import { useDashboardData } from "../../lib/hooks/useDashboardData"

interface CallsTableProps {
  callRecords: CallRecord[]
}

export function CallsTable({ callRecords }: CallsTableProps) {
  console.log("Call Records:", callRecords) // Debugging line
  const { getCallRecording } = useDashboardData()

  const [currentAudio, setCurrentAudio] = useState<{
    element: HTMLAudioElement
    filename: string
    currentTime: number
    duration: number
  } | null>(null)
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePlayAudio = async (filename: string) => {
    try {
      if (currentAudio?.filename === filename) {
        if (currentAudio.element.paused) {
          await currentAudio.element.play()
        } else {
          currentAudio.element.pause()
        }
        return
      }
      if (currentAudio) {
        currentAudio.element.pause()
        setCurrentAudio(null)
      }
      const blob = await getCallRecording(filename)
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => {
        URL.revokeObjectURL(url)
        setCurrentAudio(null)
      }
      audio.ontimeupdate = () => {
        setCurrentAudio((prev) =>
          prev ? { ...prev, currentTime: audio.currentTime } : null
        )
      }
      audio.onloadedmetadata = () => {
        setCurrentAudio({
          element: audio,
          filename,
          currentTime: 0,
          duration: audio.duration,
        })
      }
      await audio.play()
    } catch (e) {
      console.error("Error playing audio:", e)
    }
  }

  const handleSeek = (value: number[]) => {
    if (currentAudio) {
      currentAudio.element.currentTime = value[0]
      setCurrentAudio({
        ...currentAudio,
        currentTime: value[0],
      })
    }
  }

  const handleSkip = (sec: number) => {
    if (currentAudio) {
      const newTime = Math.max(
        0,
        Math.min(currentAudio.duration, currentAudio.currentTime + sec)
      )
      currentAudio.element.currentTime = newTime
      setCurrentAudio({
        ...currentAudio,
        currentTime: newTime,
      })
    }
  }

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleViewTranscript = (record: CallRecord) => {
    setSelectedCall(record)
    setIsDialogOpen(true)
  }

  if (!callRecords.length) {
    return <div>No hay llamadas registradas</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Análisis</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callRecords.map((record) => (
              <TableRow key={record.call_id}>
                <TableCell>
                  {record.employee_first_name}{" "}
                  {record.employee_last_name}
                </TableCell>
                <TableCell>
                  {format(
                    new Date(record.call_timestamp),
                    "dd/MM/yyyy HH:mm:ss",
                    { locale: es }
                  )}
                </TableCell>
                <TableCell>
                  {Math.floor(record.call_duration / 60)}:
                  {record.call_duration - Math.floor(record.call_duration / 60) * 60}
                </TableCell>
                <TableCell>
                  {record.category_name ? (
                    <Badge variant="secondary">
                      {record.category_name}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Sin Categoría</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {record.sentiment != null ? (
                    <Badge
                      className={
                        record.sentiment === "Positive"
                          ? "bg-green-500 text-white"
                          : record.sentiment === "Negative"
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                          : "border bg-accent text-accent-foreground"
                      }
                    >
                      {record.sentiment === "Positive"
                        ? "Positivo"
                        : record.sentiment === "Negative"
                        ? "Conflicto"
                        : "Normal"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{record.sentiment}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {currentAudio?.filename ===
                  record.audio_filename ? (
                    <div className="flex flex-col gap-2 w-[200px]">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            handleViewTranscript(record)
                          }
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSkip(-10)}
                        >
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handlePlayAudio(record.audio_filename)
                          }
                        >
                          {currentAudio.element.paused ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSkip(10)}
                        >
                          <SkipForward className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTime(currentAudio.currentTime)} /{" "}
                          {formatTime(currentAudio.duration)}
                        </span>
                      </div>
                      <Slider
                        value={[currentAudio.currentTime]}
                        max={currentAudio.duration}
                        step={1}
                        onValueChange={handleSeek}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          handleViewTranscript(record)
                        }
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handlePlayAudio(record.audio_filename)
                        }
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transcripción de Llamada</DialogTitle>
            <DialogDescription>
              {selectedCall && (
                <span>
                  {selectedCall.employee_first_name}{" "}
                  {selectedCall.employee_last_name} -{" "}
                  {format(
                    new Date(selectedCall.call_timestamp),
                    "dd/MM/yyyy HH:mm:ss",
                    { locale: es }
                  )}{" "}
                  - Duración:{" "}
                  {Math.floor(
                    selectedCall.call_duration / 60
                  )}
                  :{(selectedCall.call_duration % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {selectedCall?.transcription ||
                "No hay transcripción disponible"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
