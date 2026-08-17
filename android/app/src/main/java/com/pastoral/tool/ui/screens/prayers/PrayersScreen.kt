package com.pastoral.tool.ui.screens.prayers

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Favorite
import androidx.compose.material.icons.outlined.VolunteerActivism
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Suivi des prières", style = MaterialTheme.typography.headlineMedium)

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Titre") },
            leadingIcon = { Icon(Icons.Outlined.VolunteerActivism, contentDescription = null) },
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = request,
            onValueChange = { request = it },
            label = { Text("Demande") },
            leadingIcon = { Icon(Icons.Outlined.Favorite, contentDescription = null) },
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
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Icon(Icons.Filled.Add, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Ajouter")
        }

        HorizontalDivider(modifier = Modifier.padding(top = 4.dp))

        if (prayers.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    Icons.Outlined.Favorite,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    tint = MaterialTheme.colorScheme.outline
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Aucune prière enregistrée",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                prayers.forEach { prayer ->
                    OutlinedCard(modifier = Modifier.fillMaxWidth(), shape = MaterialTheme.shapes.medium) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(prayer.title, style = MaterialTheme.typography.titleMedium)
                                Text(
                                    prayer.request,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    prayer.date,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
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
}