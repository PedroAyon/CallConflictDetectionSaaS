"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, FileText } from "lucide-react"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function CallsTable() {
  const { callRecords, isLoading, error, fetchCallRecords, getCallRecording, fetchCompanyByAdmin } = useDashboardData()
  const [currentAudio, setCurrentAudio] = useState<{
    element: HTMLAudioElement;
    filename: string;
    currentTime: number;
    duration: number;
  } | null>(null)
  const [selectedCall, setSelectedCall] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const company = await fetchCompanyByAdmin() // The hook will use the stored token
        if (company?.company_id) {
          const defaultFilters = {
            start_time: format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
            end_time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          }
          await fetchCallRecords(company.company_id, defaultFilters)
        }
      } catch (error) {
        console.error("Error fetching calls data:", error)
      }
    }

    fetchData()
  }, [fetchCallRecords, fetchCompanyByAdmin])

  const handlePlayAudio = async (filename: string) => {
    try {
      // If we're trying to play/pause the current audio
      if (currentAudio?.filename === filename) {
        if (currentAudio.element.paused) {
          // Resume playback
          await currentAudio.element.play()
        } else {
          // Pause playback
          currentAudio.element.pause()
        }
        return
      }

      // If we're switching to a different audio
      if (currentAudio) {
        currentAudio.element.pause()
        setCurrentAudio(null)
      }

      // Get the audio file
      const audioBlob = await getCallRecording(filename)
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      // Set up audio event listeners
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        setCurrentAudio(null)
      }

      audio.ontimeupdate = () => {
        setCurrentAudio(prev => prev ? {
          ...prev,
          currentTime: audio.currentTime
        } : null)
      }

      audio.onloadedmetadata = () => {
        setCurrentAudio({
          element: audio,
          filename,
          currentTime: 0,
          duration: audio.duration
        })
      }

      // Start playing
      await audio.play()
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const handleSeek = (value: number[]) => {
    if (currentAudio) {
      const newTime = value[0]
      currentAudio.element.currentTime = newTime
      setCurrentAudio(prev => prev ? {
        ...prev,
        currentTime: newTime
      } : null)
    }
  }

  const handleSkip = (seconds: number) => {
    if (currentAudio) {
      const newTime = Math.max(0, Math.min(currentAudio.duration, currentAudio.currentTime + seconds))
      currentAudio.element.currentTime = newTime
      setCurrentAudio(prev => prev ? {
        ...prev,
        currentTime: newTime
      } : null)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleViewTranscript = (record: any) => {
    console.log("aaa");
    console.log(record);
    setSelectedCall(record)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div>Cargando llamadas...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
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
              <TableHead>Análisis</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callRecords.map((record) => (
              <TableRow key={record.call_id}>
                <TableCell>
                  {record.employee_first_name} {record.employee_last_name}
                </TableCell>
                <TableCell>
                  {format(new Date(record.call_timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                </TableCell>
                <TableCell>
                  {Math.floor(record.call_duration / 60)}:{(record.call_duration % 60).toString().padStart(2, '0')}
                </TableCell>
                <TableCell>
                  {record.conflict_value !== null ? (
                    <Badge variant={record.conflict_value > 0 ? "destructive" : "outline"}>
                      {record.conflict_value > 0 ? "Conflicto" : "Normal"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {currentAudio?.filename === record.audio_file_path ? (
                    <div className="flex flex-col gap-2 w-[200px]">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewTranscript(record)}>
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver transcripción</span>
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
                          onClick={() => handlePlayAudio(record.audio_file_path)}
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
                          {formatTime(currentAudio.currentTime)} / {formatTime(currentAudio.duration)}
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
                      <Button variant="outline" size="icon" onClick={() => handleViewTranscript(record)}>
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Ver transcripción</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayAudio(record.audio_file_path)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transcripción de Llamada</DialogTitle>
            <DialogDescription>
              {selectedCall && (
                <span>
                  {selectedCall.employee_first_name} {selectedCall.employee_last_name} -{" "}
                  {format(new Date(selectedCall.call_timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })} -{" "}
                  Duración: {Math.floor(selectedCall.call_duration / 60)}:{(selectedCall.call_duration % 60).toString().padStart(2, '0')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {selectedCall?.transcription || "No hay transcripción disponible"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
