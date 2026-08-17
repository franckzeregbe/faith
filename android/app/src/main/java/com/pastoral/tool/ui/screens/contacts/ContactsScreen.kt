package com.pastoral.tool.ui.screens.contacts

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.FileUpload
import androidx.compose.material.icons.outlined.Person
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
import com.pastoral.tool.domain.Contact
import com.pastoral.tool.ui.theme.FaithGradientEnd
import com.pastoral.tool.ui.theme.FaithGradientMid
import com.pastoral.tool.ui.theme.FaithGradientStart
import java.util.UUID

@Composable
fun ContactsScreen(app: FaithApp) {
    val contacts by app.repository.contacts.collectAsState()
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
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
                "Annuaire pastoral",
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
                Text("Nouveau contact", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nom") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Téléphone") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Adresse") },
                    shape = MaterialTheme.shapes.small,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Catégorie") },
                    shape = MaterialTheme.shapes.small,
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
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Ajouter")
                    }
                    FilledTonalButton(onClick = {
                        val rows = contacts.map { listOf(it.id, it.name, it.phone, it.email, it.address, it.category, it.notes) }
                        ExportManager.shareCSV(context, "contacts.csv", listOf("id", "nom", "téléphone", "email", "adresse", "catégorie", "notes"), rows)
                    }) {
                        Icon(Icons.Outlined.FileUpload, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("CSV")
                    }
                }
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

        Text("Contacts enregistrés", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        if (contacts.isEmpty()) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(vertical = 48.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Outlined.Person,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    tint = MaterialTheme.colorScheme.outline
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "Aucun contact enregistré",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            Column {
                contacts.forEach { contact ->
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
                                    imageVector = Icons.Outlined.Person,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(contact.name, style = MaterialTheme.typography.titleMedium)
                                Text(
                                    "${contact.phone} • ${contact.email}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                if (contact.category.isNotBlank()) Text(
                                    "Cat. : ${contact.category}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            IconButton(onClick = { app.repository.removeContact(contact.id) }) {
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
