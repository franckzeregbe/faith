package com.pastoral.tool.ui.screens.contacts

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
import com.pastoral.tool.domain.Contact
import java.util.UUID

@Composable
fun ContactsScreen(app: FaithApp) {
    val contacts by app.repository.contacts.collectAsState()
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Annuaire pastoral", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nom") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Téléphone") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Adresse") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = category,
            onValueChange = { category = it },
            label = { Text("Catégorie") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )

        val context = LocalContext.current
        Row(modifier = Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        app.repository.addContact(
                            Contact(
                                id = UUID.randomUUID().toString(),
                                name = name,
                                phone = phone,
                                email = email,
                                address = address,
                                category = category
                            )
                        )
                        name = ""
                        phone = ""
                        email = ""
                        address = ""
                        category = ""
                    }
                }
            ) {
                Text("Ajouter")
            }
            OutlinedButton(onClick = {
                val rows = contacts.map { listOf(it.id, it.name, it.phone, it.email, it.address, it.category, it.notes) }
                ExportManager.shareCSV(context, "contacts.csv", listOf("id", "nom", "téléphone", "email", "adresse", "catégorie", "notes"), rows)
            }) {
                Text("📤 CSV")
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        LazyColumn {
            items(contacts) { contact ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(contact.name, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "${contact.phone} • ${contact.email}",
                                style = MaterialTheme.typography.bodySmall
                            )
                            if (contact.category.isNotBlank()) Text(
                                "Cat. : ${contact.category}",
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                        TextButton(onClick = { app.repository.removeContact(contact.id) }) {
                            Text("Suppr.")
                        }
                    }
                }
            }
        }
    }
}
