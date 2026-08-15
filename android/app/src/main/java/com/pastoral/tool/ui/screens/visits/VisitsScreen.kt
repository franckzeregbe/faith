package com.pastoral.tool.ui.screens.visits

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
import com.pastoral.tool.domain.Visit
import java.text.SimpleDateFormat
import java.util.*
import java.util.UUID

@Composable
fun VisitsScreen(app: FaithApp) {
    val visits by app.repository.visits.collectAsState()
    var personName by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Visites pastorales", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = personName,
            onValueChange = { personName = it },
            label = { Text("Personne") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Adresse") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = date,
            onValueChange = { date = it },
            label = { Text("Date (AAAA-MM-JJ)") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )

        val context = LocalContext.current
        Row(modifier = Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    if (personName.isNotBlank() && date.isNotBlank()) {
                        app.repository.addVisit(
                            Visit(
                                id = UUID.randomUUID().toString(),
                                personName = personName,
                                address = address,
                                date = date,
                                notes = notes
                            )
                        )
                        personName = ""
                        address = ""
                        date = ""
                        notes = ""
                    }
                }
            ) {
                Text("Ajouter")
            }
            OutlinedButton(onClick = {
                val rows = visits.map { listOf(it.id, it.personName, it.date, it.address, it.notes) }
                ExportManager.shareCSV(context, "visites.csv", listOf("id", "nom", "date", "adresse", "notes"), rows)
            }) {
                Text("📤 CSV")
            }
            OutlinedButton(onClick = {
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val events = visits.mapNotNull {
                    val d = try { sdf.parse(it.date) } catch (_: Exception) { null }
                    ICalEvent(uid = it.id, summary = "Visite — ${it.personName}", description = it.notes, location = it.address, date = d)
                }
                ExportManager.shareICal(context, "visites.ics", events)
            }) {
                Text("📆 iCal")
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        LazyColumn {
            items(visits) { visit ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(visit.personName, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "${visit.date} • ${visit.address}",
                                style = MaterialTheme.typography.bodySmall
                            )
                            if (visit.notes.isNotBlank()) Text(
                                visit.notes,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                        TextButton(onClick = { app.repository.removeVisit(visit.id) }) {
                            Text("Suppr.")
                        }
                    }
                }
            }
        }
    }
}
