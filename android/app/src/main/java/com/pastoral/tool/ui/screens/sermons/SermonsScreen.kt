package com.pastoral.tool.ui.screens.sermons

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
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

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Prédications & notes", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Titre") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = date,
            onValueChange = { date = it },
            label = { Text("Date") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = reference,
            onValueChange = { reference = it },
            label = { Text("Référence biblique") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Notes") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
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
            modifier = Modifier.padding(top = 12.dp)
        ) {
            Text("Ajouter")
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        LazyColumn {
            items(sermons) { sermon ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(sermon.title, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "${sermon.date} • ${sermon.reference}",
                                style = MaterialTheme.typography.bodySmall
                            )
                            if (sermon.notes.isNotBlank()) Text(
                                sermon.notes,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                        TextButton(onClick = { app.repository.removeSermon(sermon.id) }) {
                            Text("Suppr.")
                        }
                    }
                }
            }
        }
    }
}
