package com.example.callrecorder2

import android.annotation.SuppressLint
import android.content.Context
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext


// Objeto singleton que se encarga de subir archivos (por ejemplo, grabaciones de audio) al servidor mediante HTTP
object HttpUploader {

    // Cliente HTTP de OkHttp que se usará para hacer la petición de subida
    private val client = OkHttpClient()

    // Función suspendida que realiza la subida de un archivo al servidor.
    // Usa `Dispatchers.IO` para hacer la operación en un hilo de entrada/salida (evita bloquear el hilo principal).
    @SuppressLint("SimpleDateFormat")
    suspend fun uploadFile(file: File, url: String, context: Context) = withContext(Dispatchers.IO) {
        val token = PrefsManager.getToken(context)
        if (token.isNullOrEmpty()) {
            throw IOException("Token no encontrado. No se puede subir el archivo.")
        }

        // Obtiene la fecha y hora de creación del archivo en formato ISO 8601
        val lastModified = file.lastModified()
        val timestamp = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
            .apply { timeZone = java.util.TimeZone.getTimeZone("GMT-6") }
            .format(java.util.Date(lastModified))

        // Cuerpo de la solicitud multipart
        val requestBody = MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("call_timestamp", timestamp)
            .addFormDataPart("filename", file.name)
            .addFormDataPart(
                "audio_file",
                file.name,
                file.asRequestBody("audio/*".toMediaType())
            )
            .build()

        val request = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $token")
            .post(requestBody)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Error en la subida: ${response.code} ${response.message}")
            }
        }
    }
}
