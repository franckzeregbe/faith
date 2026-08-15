package com.pastoral.tool.ui.screens.messages

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.MessageDraft
import java.util.UUID

private val messageTemplates = listOf(
    "Que la paix de Jésus-Christ habite votre cœur aujourd'hui et toujours.",
    "N'oubliez jamais : Dieu a un plan merveilleux pour votre vie. (Jérémie 29:11)",
    "La grâce du Seigneur est renouvelée chaque matin. Bonne journée dans la foi !",
    "Que le Saint-Esprit vous guide et vous fortifie dans toutes vos décisions.",
    "Jésus est le chemin, la vérité et la vie. Partagez cette lumière autour de vous !",
    "Aujourd'hui, choisissez la joie, choisissez l'amour, choisissez Jésus."
)

@Composable
fun MessagesScreen(app: FaithApp) {
    val messages by app.repository.messages.collectAsState()
    var selected by remember { mutableStateOf(messageTemplates.random()) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Inspiration & publications", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Message généré", style = MaterialTheme.typography.labelLarge)
                Spacer(modifier = Modifier.height(8.dp))
                Text(selected, style = MaterialTheme.typography.bodyLarge)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Button(onClick = { selected = messageTemplates.random() }) {
                Text("Générer")
            }
            OutlinedButton(onClick = {
                app.repository.addMessage(
                    MessageDraft(
                        id = UUID.randomUUID().toString(),
                        title = "Inspiration",
                        body = selected,
                        createdAt = System.currentTimeMillis().toString(),
                        platform = "SMS"
                    )
                )
            }) {
                Text("Sauvegarder")
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
        Text("Historique", style = MaterialTheme.typography.titleMedium)

        LazyColumn {
            items(messages) { msg ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(msg.body, style = MaterialTheme.typography.bodyMedium, maxLines = 2)
                        }
                        TextButton(onClick = { app.repository.removeMessage(msg.id) }) {
                            Text("Suppr.")
                        }
                    }
                }
            }
        }
    }
}
