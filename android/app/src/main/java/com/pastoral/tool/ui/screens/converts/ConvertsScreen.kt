package com.pastoral.tool.ui.screens.converts

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.Convert
import java.util.UUID

@Composable
fun ConvertsScreen(app: FaithApp) {
    val converts by app.repository.converts.collectAsState()
    var name by remember { mutableStateOf("") }
    var date by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Âmes gagnées à Jésus", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nom") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = date,
            onValueChange = { date = it },
            label = { Text("Date de conversion") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Téléphone") },
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
                if (name.isNotBlank() && date.isNotBlank()) {
                    app.repository.addConvert(
                        Convert(
                            id = UUID.randomUUID().toString(),
                            name = name,
                            date = date,
                            phone = phone,
                            notes = notes
                        )
                    )
                    name = ""
                    date = ""
                    phone = ""
                    notes = ""
                }
            },
            modifier = Modifier.padding(top = 12.dp)
        ) {
            Text("Ajouter")
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        LazyColumn {
            items(converts) { convert ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(convert.name, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "Converti le ${convert.date}",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        TextButton(onClick = { app.repository.removeConvert(convert.id) }) {
                            Text("Suppr.")
                        }
                    }
                }
            }
        }
    }
}
