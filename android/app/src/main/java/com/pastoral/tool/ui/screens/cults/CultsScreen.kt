package com.pastoral.tool.ui.screens.cults

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.data.export.ExportManager
import com.pastoral.tool.data.export.ICalEvent
import com.pastoral.tool.domain.Cult
import java.util.*
import java.util.UUID

@Composable
fun CultsScreen(app: FaithApp) {
    val cults by app.repository.cults.collectAsState()
    var title by remember { mutableStateOf("") }
    var day by remember { mutableStateOf("") }
    var time by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Cultes récurrents", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Titre") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = day,
            onValueChange = { day = it },
            label = { Text("Jour (1=dim..7=sam)") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = time,
            onValueChange = { time = it },
            label = { Text("Heure (HH:mm)") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = location,
            onValueChange = { location = it },
            label = { Text("Lieu") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )

        val context = LocalContext.current
        Row(modifier = Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    val dayInt = day.toIntOrNull() ?: 1
                    if (title.isNotBlank()) {
                        app.repository.addCult(
                            Cult(
                                id = UUID.randomUUID().toString(),
                                title = title,
                                dayOfWeek = dayInt,
                                time = time,
                                location = location
                            )
                        )
                        title = ""
                        day = ""
                        time = ""
                        location = ""
                    }
                }
            ) {
                Text("Ajouter")
            }
            OutlinedButton(onClick = {
                val rows = cults.map { listOf(it.id, it.title, it.dayOfWeek.toString(), it.time, it.location, it.notes) }
                ExportManager.shareCSV(context, "cultes.csv", listOf("id", "titre", "jour", "heure", "lieu", "notes"), rows)
            }) {
                Text("📤 CSV")
            }
            OutlinedButton(onClick = {
                val cal = Calendar.getInstance()
                val currentDow = cal.get(Calendar.DAY_OF_WEEK)
                val events = cults.map { cult ->
                    val diff = cult.dayOfWeek - currentDow
                    cal.add(Calendar.DAY_OF_YEAR, diff)
                    val date = cal.time
                    cal.add(Calendar.DAY_OF_YEAR, -diff)
                    ICalEvent(
                        uid = cult.id,
                        summary = "Culte — ${cult.title}",
                        description = cult.notes,
                        location = cult.location,
                        date = date
                    )
                }
                ExportManager.shareICal(context, "cultes.ics", events)
            }) {
                Text("📆 iCal")
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        LazyColumn {
            items(cults) { cult ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(cult.title, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "Jour ${cult.dayOfWeek} • ${cult.time} • ${cult.location}",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        TextButton(onClick = { app.repository.removeCult(cult.id) }) {
                            Text("Suppr.")
                        }
                    }
                }
            }
        }
    }
}
