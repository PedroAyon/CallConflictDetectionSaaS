package com.example.callrecorder2

import android.content.Context

object PrefsManager {
    private const val PREFS_NAME = "user_prefs"
    private const val KEY_AUTH_TOKEN = "auth_token"

    //EL TOKEN DE NUESTRO SERVIDOR SE GUARDA Y PROCESA AQUI

    fun saveToken(context: Context, token: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }
    ///AQUI ESTA FUNCION TE LO DA Y LO PROCESA COMO UN DATO STRING
    fun getToken(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_AUTH_TOKEN, null)
    }

    //NOS LOGUEAMOS Y VINCULAMOS NUESTRO BOTON CERRAR SESION PARA DARLE FIN AL TRABAJO DE HOY
    //EL TOKEN NO ES EL MISMO, EL SERVIDOR SE ENCARGA DE DARTE UNO NUEVO, POR QUE EXPIRA.
    //HACES UN VALIDATE TOKEN AL MOMENTO DE QUE QUIERAS INICIAR SESION SI NO LO HACE
    //QUIERE DECIR QUE EL SERVIDOR NO ESTA ENCENDIDO.
    fun isLoggedIn(context: Context): Boolean {
        return getToken(context) != null
    }

    fun logout(context: Context) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().remove(KEY_AUTH_TOKEN).apply()
    }
}
