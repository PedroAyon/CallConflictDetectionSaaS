package com.example.callrecorder2

import android.annotation.SuppressLint
import android.app.*
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.*
import android.util.Log
import android.widget.Toast
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.File

class FileTransferService : Service() {

    private lateinit var observer: FileObserver
    private val targetFolder = File(
        Environment.getExternalStorageDirectory().absolutePath + "/Recordings/Call"
    )

    private val serverUrl = "https://direct-kodiak-grateful.ngrok-free.app/call_records"
    private val validExtensions = setOf("mp3", "wav", "3gp", "amr", "m4a")
    private val serviceScope = CoroutineScope(Job() + Dispatchers.IO)

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForegroundService()
        return START_STICKY // Indica que el servicio debe reiniciarse si es eliminado
    }

    @SuppressLint("ForegroundServiceType")
    private fun startForegroundService() {
        val channelId = "file_transfer_channel"

        // Crea un canal de notificación (requerido desde Android 8)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Transferencias de archivos", // Nombre visible para el usuario
                NotificationManager.IMPORTANCE_LOW // Prioridad baja para no molestar
            )
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(channel)
        }

        // Construye la notificación
        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Servicio de Transferencia") // Título
            .setContentText("Monitoreando grabaciones...") // Texto descriptivo
            .setSmallIcon(android.R.drawable.ic_menu_upload) // Icono pequeño
            .setOngoing(true) // Notificación persistente
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                1,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(1, notification)
        }
    }

    override fun onCreate() {
        super.onCreate()
        setupFolderObserver()
//        checkInitialFiles()
    }

    // Revisa archivos que ya estaban en la carpeta al iniciar el servicio
    private fun checkInitialFiles() {
        targetFolder.listFiles()?.forEach { file -> // Para cada archivo en la carpeta
            if (file.isFile && validExtensions.contains(file.extension.lowercase())) {
                uploadWithRetry(file) // Si es archivo válido, intenta subirlo
            }
        }
    }

    // Configura el vigilante de la carpeta
    private fun setupFolderObserver() {
        if (!targetFolder.exists()) { // Si la carpeta no existe
            Toast.makeText(this, "¡Carpeta no encontrada!", Toast.LENGTH_LONG).show()
            stopSelf() // Detiene el servicio
            return
        }

        // Crea un observador que detecta nuevos archivos
        observer = object : FileObserver(targetFolder.absolutePath, CREATE or CLOSE_WRITE) {
            override fun onEvent(event: Int, path: String?) {
                when (event) { // Eventos que nos interesan:
                    CREATE, CLOSE_WRITE -> handleNewFile(path)
                    // "create" Cuando se crea un archivo
                    // "Close write" Cuando se termina de modificar
                }
            }
        }
        observer.startWatching() // Inicia la vigilancia
    }

    // Maneja los nuevos archivos detectados
    private fun handleNewFile(path: String?) {
        path?.let { // Si hay una ruta válida
            val newFile = File(targetFolder, it) // Crea objeto File
            if (validExtensions.contains(newFile.extension.lowercase())) { // Verifica extensión
                uploadWithRetry(newFile) // Intenta subir el archivo
            }
        }
    }

    // Intenta subir el archivo con reintentos
    private fun uploadWithRetry(file: File, retries: Int = 3) {
        serviceScope.launch { // Lanza una corrutina (hilo de ejecución en segundo plano)
            var attempts = 0
            while (attempts < retries) { // Hasta agotar los reintentos
                try {
                    HttpUploader.uploadFile(file, serverUrl, applicationContext)// Intento de subida

                    break // Si tiene éxito, sale del bucle
                } catch (e: Exception) {
                    attempts++ // Incrementa intentos fallidos
                    if (attempts >= retries) { // Si supera los reintentos
                        Log.e("Upqload", "Falló después de $retries intentos: ${e.message}")
                    }
                }
            }
        }
    }

    // Método obligatorio para servicios (no usado aquí)
    override fun onBind(intent: Intent?): IBinder? = null


    override fun onDestroy() {
        super.onDestroy()
        observer.stopWatching() // Detiene la vigilancia de archivos
        serviceScope.cancel() // Cancela las operaciones pendientes
    }
}