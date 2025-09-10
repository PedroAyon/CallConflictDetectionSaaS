package com.example.callrecorder2

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import org.json.JSONObject
import java.io.IOException
import okhttp3.MediaType.Companion.toMediaTypeOrNull

class LoginActivity : AppCompatActivity() {

    private val client = OkHttpClient()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Log.d("LoginActivity", "onCreate llamado")

        if (PrefsManager.isLoggedIn(this)) {
            Log.d("LoginActivity", "Ya está logueado, redirigiendo a MainActivity")
            startActivity(Intent(this, MainActivity::class.java)) // abre la pantalla principal
            finish()
            return
        }

        setContentView(R.layout.activity_login)
        Log.d("LoginActivity", "Mostrando layout de login")

        val usernameField = findViewById<EditText>(R.id.editUsername)
        val passwordField = findViewById<EditText>(R.id.editPassword)
        val loginBtn = findViewById<Button>(R.id.btnLogin)

        loginBtn.setOnClickListener {
            val username = usernameField.text.toString() // obtiene el texto escrito en el campo usuario
            val password = passwordField.text.toString() // obtiene la contraseña
            authenticateUser(username, password) // llama a la función que valida con el servidor
        }
    }

    // Esta función envía el usuario y contraseña al servidor para autenticarse
    private fun authenticateUser(username: String, password: String) {
        // URL del backend donde se encuentra el endpoint de login
        val url = "https://direct-kodiak-grateful.ngrok-free.app/login"

        // Se crea un objeto JSON con los datos de inicio de sesión
        val jsonBody = JSONObject()
        jsonBody.put("username", username)
        jsonBody.put("password", password)

        // Se crea el cuerpo de la solicitud HTTP con los datos en formato JSON
        val requestBody = RequestBody.create(
            "application/json".toMediaTypeOrNull(),
            jsonBody.toString()
        )

        // Se construye la solicitud POST para enviar al servidor
        val request = Request.Builder()
            .url(url) // Endpoint del servidor
            .post(requestBody) // Enviamos los datos como JSON
            .build()

        // Se envía la solicitud al servidor en segundo plano
        client.newCall(request).enqueue(object : Callback {
            // Si ocurre un error de conexión (por ejemplo, sin internet)
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@LoginActivity, "Error de conexión", Toast.LENGTH_SHORT).show()
                    Log.e("LoginActivity", "Error: ${e.message}")
                }
            }

            // Cuando el servidor responde
            override fun onResponse(call: Call, response: Response) {
                val responseBody = response.body?.string() // obtenemos el contenido de la respuesta
                runOnUiThread {
                    // Si la respuesta fue exitosa y el servidor envió datos
                    if (response.isSuccessful && responseBody != null) {
                        val json = JSONObject(responseBody) // Parseamos la respuesta JSON
                        val token = json.getString("token") // Extraemos el token JWT del JSON
                        PrefsManager.saveToken(this@LoginActivity, token) // Guardamos el token en preferencias

                        // Abrimos la pantalla principal y cerramos esta
                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                        finish()
                    } else {
                        // Si el login falla, se intenta mostrar el mensaje de error enviado por el servidor
                        val error = try {
                            JSONObject(responseBody ?: "").getString("error")
                        } catch (e: Exception) {
                            "Credenciales inválidas" // Si no hay mensaje, se muestra uno genérico
                        }
                        Toast.makeText(this@LoginActivity, error, Toast.LENGTH_SHORT).show()
                        Log.e("LoginActivity", "Login fallido: $responseBody")
                    }
                }
            }
        })
    }
}