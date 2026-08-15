package com.pastoral.tool.data.export

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.pastoral.tool.domain.*
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

object ExportManager {

    fun shareCSV(context: Context, filename: String, headers: List<String>, rows: List<List<String>>) {
        val csv = buildCSV(headers, rows)
        val file = File(context.cacheDir, filename).apply { writeText(csv) }
        val uri = getUri(context, file)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/csv"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, filename)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, "Partager CSV"))
    }

    fun shareICal(context: Context, filename: String, events: List<ICalEvent>) {
        val ical = buildICal(events)
        val file = File(context.cacheDir, filename).apply { writeText(ical) }
        val uri = getUri(context, file)
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/calendar"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, filename)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, "Partager iCal"))
    }

    private fun getUri(context: Context, file: File): Uri {
        return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    }

    private fun buildCSV(headers: List<String>, rows: List<List<String>>): String {
        val lines = mutableListOf(headers.joinToString(","))
        rows.forEach { row ->
            lines.add(row.joinToString(",") { csvSafe(it) })
        }
        return lines.joinToString("\n")
    }

    private fun csvSafe(s: String): String {
        val needsQuote = s.contains(",") || s.contains("\"") || s.contains("\n")
        return if (needsQuote) "\"${s.replace("\"", "\"\"")}\"" else s
    }

    private fun buildICal(events: List<ICalEvent>): String {
        val lines = mutableListOf(
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//FAITH//Outil Pastoral//FR",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH"
        )
        val fmt = SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }
        events.forEach { event ->
            val dtstamp = fmt.format(Date())
            val dtstart = event.date?.let { fmt.format(it) } ?: dtstamp
            lines.add("BEGIN:VEVENT")
            lines.add("UID:${event.uid}")
            lines.add("DTSTAMP:$dtstamp")
            lines.add("DTSTART:$dtstart")
            lines.add("SUMMARY:${event.summary}")
            if (event.description.isNotBlank()) lines.add("DESCRIPTION:${event.description}")
            if (event.location.isNotBlank()) lines.add("LOCATION:${event.location}")
            lines.add("END:VEVENT")
        }
        lines.add("END:VCALENDAR")
        return lines.joinToString("\r\n")
    }
}

data class ICalEvent(
    val uid: String,
    val summary: String,
    val description: String = "",
    val location: String = "",
    val date: Date? = null
)
