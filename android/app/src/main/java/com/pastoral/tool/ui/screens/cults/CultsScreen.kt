package com.pastoral.tool.ui.screens.cults

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Event
import androidx.compose.material.icons.outlined.FileUpload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.data.export.ExportManager
import com.pastoral.tool.data.export.ICalEvent
import com.pastoral.tool.domain.Cult
import com.pastoral.tool.ui.theme.FaithGradientEnd
import com.pastoral.tool.ui.theme.FaithGradientMid
import com.pastoral.tool.ui.theme.FaithGradientStart
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
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd)),
                    shape = MaterialTheme.shapes.large
                )
                .padding(20.dp)
        ) {
            Text(
                "Cultes récurrents",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White
            )
        }
        Spacer(modifier = Modifier.height(16.dp))

        ElevatedCard(
            modifier = Modifier.fillMaxWidth(),
            shape = MaterialTheme.shapes.medium
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Nouveau culte", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Titre") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = day,
                    onValueChange = { day = it },
                    label = { Text("Jour (1=dim..7=sam)") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = time,
                    onValueChange = { time = it },
                    label = { Text("Heure (HH:mm)") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = location,
                    onValueChange = { location = it },
                    label = { Text("Lieu") },
                    shape = MaterialTheme.shapes.small,
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
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Ajouter")
                    }
                    FilledTonalButton(onClick = {
                        val rows = cults.map { listOf(it.id, it.title, it.dayOfWeek.toString(), it.time, it.location, it.notes) }
                        ExportManager.shareCSV(context, "cultes.csv", listOf("id", "titre", "jour", "heure", "lieu", "notes"), rows)
                    }) {
                        Icon(Icons.Outlined.FileUpload, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("CSV")
                    }
                    FilledTonalButton(onClick = {
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
                        Icon(Icons.Outlined.Event, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("iCal")
                    }
                }
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        Text("Cultes enregistrés", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        if (cults.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(vertical = 48.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Outlined.DateRange,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    tint = MaterialTheme.colorScheme.outline
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Aucun culte enregistré",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn {
                items(cults) { cult ->
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.DateRange,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(cult.title, style = MaterialTheme.typography.titleMedium)
                                Text(
                                    "Jour ${cult.dayOfWeek} • ${cult.time} • ${cult.location}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            IconButton(onClick = { app.repository.removeCult(cult.id) }) {
                                Icon(
                                    imageVector = Icons.Outlined.Delete,
                                    contentDescription = "Suppr."
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
