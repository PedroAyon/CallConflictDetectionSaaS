"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Slider } from "@/components/ui/slider"

export function CallsTable() {
  const { callRecords, isLoading, error, fetchCallRecords, getCallRecording, fetchCompanyByAdmin } = useDashboardData()
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

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

  useEffect(() => {
    if (audioElement) {
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime)
      }
      const updateDuration = () => {
        setDuration(audioElement.duration)
      }
      
      audioElement.addEventListener('timeupdate', updateTime)
      audioElement.addEventListener('loadedmetadata', updateDuration)
      
      return () => {
        audioElement.removeEventListener('timeupdate', updateTime)
        audioElement.removeEventListener('loadedmetadata', updateDuration)
      }
    }
  }, [audioElement])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayAudio = async (filename: string) => {
    try {
      if (playingAudio === filename) {
        // Stop playing
        audioElement?.pause()
        setPlayingAudio(null)
        setAudioElement(null)
        setCurrentTime(0)
        setDuration(0)
        return
      }

      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause()
        setAudioElement(null)
        setCurrentTime(0)
        setDuration(0)
      }

      // Get the audio file
      const audioBlob = await getCallRecording(filename)
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        setPlayingAudio(null)
        setAudioElement(null)
        setCurrentTime(0)
        setDuration(0)
        URL.revokeObjectURL(audioUrl)
      }

      setAudioElement(audio)
      setPlayingAudio(filename)
      audio.play()
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioElement) {
      audioElement.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleSkip = (seconds: number) => {
    if (audioElement) {
      audioElement.currentTime = Math.max(0, Math.min(audioElement.duration, audioElement.currentTime + seconds))
    }
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Fecha y Hora</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Conflicto</TableHead>
            <TableHead>Audio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {callRecords.map((record) => (
            <TableRow key={record.employee_username}>
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
                {record.conflict_value !== null ? `${(record.conflict_value * 100).toFixed(1)}%` : "N/A"}
              </TableCell>
              <TableCell>
                {playingAudio === record.audio_file_path ? (
                  <div className="flex flex-col gap-2 w-[200px]">
                    <div className="flex items-center gap-2">
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
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSkip(10)}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={handleSeek}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayAudio(record.audio_file_path)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
