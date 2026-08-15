package com.pastoral.tool.ui.screens.prayers

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.Prayer
import java.util.UUID

@Composable
fun PrayersScreen(app: FaithApp) {
    val prayers by app.repository.prayers.collectAsState()
    var title by remember { mutableStateOf("") }
    var request by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Suivi des prières", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Titre") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = request,
            onValueChange = { request = it },
            label = { Text("Demande") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = date,
            onValueChange = { date = it },
            label = { Text("Date") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )

        Button(
            onClick = {
                if (title.isNotBlank() && request.isNotBlank()) {
                    app.repository.addPrayer(
                        Prayer(
                            id = UUID.randomUUID().toString(),
                            title = title,
                            request = request,
                            date = date
                        )
                    )
                    title = ""
                    request = ""
                    date = ""
                }
            },
            modifier = Modifier.padding(top = 12.dp)
        ) {
            Text("Ajouter")
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        LazyColumn {
            items(prayers) { prayer ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(prayer.title, style = MaterialTheme.typography.titleMedium)
                            Text(prayer.request, style = MaterialTheme.typography.bodyMedium)
                            Text(prayer.date, style = MaterialTheme.typography.bodySmall)
                        }
                        Checkbox(
                            checked = prayer.answered,
                            onCheckedChange = {
                                val updated = prayers.map {
                                    if (it.id == prayer.id) it.copy(answered = !prayer.answered) else it
                                }
                                app.repository.savePrayers(updated)
                            }
                        )
                    }
                }
            }
        }
    }
}
