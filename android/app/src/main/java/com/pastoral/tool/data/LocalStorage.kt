package com.pastoral.tool.data

import android.content.Context
import kotlinx.serialization.json.Json
import kotlinx.serialization.serializer
import java.io.File

class LocalStorage(@PublishedApi internal val context: Context) {
    @PublishedApi
    internal val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
    }

    inline fun <reified T> load(fileName: String, default: T): T {
        val file = File(context.filesDir, fileName)
        return try {
            if (!file.exists()) return default
            json.decodeFromString(serializer<T>(), file.readText())
        } catch (e: Exception) {
            default
        }
    }

    inline fun <reified T> save(fileName: String, value: T) {
        val file = File(context.filesDir, fileName)
        file.writeText(json.encodeToString(serializer<T>(), value))
    }
}
