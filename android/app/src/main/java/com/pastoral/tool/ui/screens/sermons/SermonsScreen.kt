package com.pastoral.tool.ui.screens.sermons

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.automirrored.outlined.Notes
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.Sermon
import java.util.UUID

@Composable
fun SermonsScreen(app: FaithApp) {
    val sermons by app.repository.sermons.collectAsState()
    var title by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }
    var reference by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Prédications & notes", style = MaterialTheme.typography.headlineMedium)

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Titre") },
            leadingIcon = { Icon(Icons.Outlined.Mic, contentDescription = null) },
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = date,
            onValueChange = { date = it },
            label = { Text("Date") },
            leadingIcon = { Icon(Icons.Outlined.DateRange, contentDescription = null) },
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = reference,
            onValueChange = { reference = it },
            label = { Text("Référence biblique") },
            leadingIcon = { Icon(Icons.AutoMirrored.Outlined.MenuBook, contentDescription = null) },
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            leadingIcon = { Icon(Icons.AutoMirrored.Outlined.Notes, contentDescription = null) },
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.fillMaxWidth()
        )

        Button(
            onClick = {
                if (title.isNotBlank()) {
                    app.repository.addSermon(
                        Sermon(
                            id = UUID.randomUUID().toString(),
                            title = title,
                            date = date,
                            reference = reference,
                            notes = notes
                        )
                    )
                    title = ""
                    date = ""
                    reference = ""
                    notes = ""
                }
            },
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Icon(Icons.Filled.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Ajouter")
        }

        HorizontalDivider(modifier = Modifier.padding(top = 4.dp))

        if (sermons.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    Icons.Outlined.Mic,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    tint = MaterialTheme.colorScheme.outline
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Aucune prédication enregistrée",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                sermons.forEach { sermon ->
                    OutlinedCard(modifier = Modifier.fillMaxWidth(), shape = MaterialTheme.shapes.medium) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(sermon.title, style = MaterialTheme.typography.titleMedium)
                                Text(
                                    "${sermon.date} • ${sermon.reference}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                if (sermon.notes.isNotBlank()) Text(
                                    sermon.notes,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                            IconButton(onClick = { app.repository.removeSermon(sermon.id) }) {
                                Icon(
                                    Icons.Outlined.Delete,
                                    contentDescription = "Supprimer",
                                    tint = MaterialTheme.colorScheme.error
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}