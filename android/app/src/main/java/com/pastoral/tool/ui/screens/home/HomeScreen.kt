package com.pastoral.tool.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.pastoral.tool.FaithApp
import com.pastoral.tool.ui.navigation.*

@Composable
fun HomeScreen(app: FaithApp, navController: NavHostController) {
    val profile by app.repository.profile.collectAsState()
    val visits by app.repository.visits.collectAsState()
    val contacts by app.repository.contacts.collectAsState()
    val cults by app.repository.cults.collectAsState()
    val converts by app.repository.converts.collectAsState()
    val prayers by app.repository.prayers.collectAsState()

    val stats = listOf(
        "Visites" to visits.size.toString(),
        "Contacts" to contacts.size.toString(),
        "Cultes" to cults.size.toString(),
        "Âmes" to converts.size.toString(),
        "Prières" to prayers.size.toString()
    )

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        if (profile.name.isNotBlank()) {
            Text(
                "Bienvenue, ${profile.name} !",
                style = MaterialTheme.typography.headlineMedium
            )
            Text(
                profile.church,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.secondary
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(stats) { (label, value) ->
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            label,
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(value, style = MaterialTheme.typography.headlineMedium)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Accès rapide", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        val quickItems = listOf(
            DrawerItem(VisitsRoute, "Visites", "📋"),
            DrawerItem(ContactsRoute, "Contacts", "👥"),
            DrawerItem(MessagesRoute, "Inspiration", "✉️"),
            DrawerItem(BibleRoute, "Bible", "📜")
        )

        quickItems.forEach { item ->
            OutlinedButton(
                onClick = { navController.navigate(item.route) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            ) {
                Text("${item.icon} ${item.label}")
            }
        }
    }
}
