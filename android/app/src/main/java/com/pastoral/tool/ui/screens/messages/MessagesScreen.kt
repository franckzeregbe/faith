package com.pastoral.tool.ui.screens.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Article
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.MessageDraft
import com.pastoral.tool.ui.theme.FaithGradientEnd
import com.pastoral.tool.ui.theme.FaithGradientMid
import com.pastoral.tool.ui.theme.FaithGradientStart
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

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(MaterialTheme.shapes.medium)
                .background(Brush.horizontalGradient(listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd)))
                .padding(20.dp)
        ) {
            Column {
                Text(
                    "Message généré",
                    style = MaterialTheme.typography.labelLarge,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    selected,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Button(
                onClick = { selected = messageTemplates.random() },
                modifier = Modifier.height(48.dp)
            ) {
                Icon(Icons.Outlined.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Générer")
            }
            FilledTonalButton(
                onClick = {
                    app.repository.addMessage(
                        MessageDraft(
                            id = UUID.randomUUID().toString(),
                            title = "Inspiration",
                            body = selected,
                            createdAt = System.currentTimeMillis().toString(),
                            platform = "SMS"
                        )
                    )
                },
                modifier = Modifier.height(48.dp)
            ) {
                Icon(Icons.AutoMirrored.Outlined.Send, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sauvegarder")
            }
        }

        HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
        Text("Historique", style = MaterialTheme.typography.titleMedium)

        LazyColumn {
            if (messages.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Outlined.Article,
                            contentDescription = null,
                            modifier = Modifier.size(40.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Aucun message sauvegardé.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(messages) { msg ->
                    ElevatedCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Row(
                            modifier = Modifier.padding(start = 16.dp, top = 8.dp, bottom = 8.dp, end = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                msg.body,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 2,
                                modifier = Modifier.weight(1f)
                            )
                            TextButton(
                                onClick = { app.repository.removeMessage(msg.id) },
                                colors = ButtonDefaults.textButtonColors(
                                    contentColor = MaterialTheme.colorScheme.error
                                ),
                                modifier = Modifier.height(48.dp)
                            ) {
                                Text("Suppr.")
                            }
                        }
                    }
                }
            }
        }
    }
}