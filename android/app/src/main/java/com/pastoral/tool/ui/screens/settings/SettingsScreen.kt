package com.pastoral.tool.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.AppSettings
import com.pastoral.tool.domain.Profile
import com.pastoral.tool.ui.navigation.HomeRoute

@Composable
fun SettingsScreen(app: FaithApp, navController: NavHostController) {
    val settings by app.repository.settings.collectAsState()
    var showReset by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Paramètres", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        ElevatedCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Outlined.DarkMode,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Text("Mode sombre", modifier = Modifier.weight(1f))
                    Switch(
                        checked = settings.darkMode,
                        onCheckedChange = {
                            app.repository.saveSettings(settings.copy(darkMode = it))
                        }
                    )
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant)

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Outlined.Notifications,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Text("Notifications", modifier = Modifier.weight(1f))
                    Switch(
                        checked = settings.notificationsEnabled,
                        onCheckedChange = {
                            app.repository.saveSettings(settings.copy(notificationsEnabled = it))
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Sécurité & données", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
            onClick = { app.repository.saveSettings(settings.copy(pinHash = null)) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Outlined.Lock, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Supprimer le code PIN")
        }

        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = { showReset = true },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Filled.Delete, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Tout réinitialiser")
        }
    }

    if (showReset) {
        AlertDialog(
            onDismissRequest = { showReset = false },
            title = { Text("Confirmer") },
            text = { Text("Cela effacera toutes les données locales. Continuer ?") },
            confirmButton = {
                TextButton(onClick = {
                    app.repository.saveProfile(Profile())
                    app.repository.saveVisits(emptyList())
                    app.repository.saveContacts(emptyList())
                    app.repository.saveCults(emptyList())
                    app.repository.saveConverts(emptyList())
                    app.repository.saveSermons(emptyList())
                    app.repository.savePrayers(emptyList())
                    app.repository.saveMessages(emptyList())
                    app.repository.saveSettings(AppSettings())
                    showReset = false
                    navController.navigate(HomeRoute) {
                        popUpTo(navController.graph.startDestinationId) { inclusive = true }
                    }
                }) {
                    Text("Oui, effacer")
                }
            },
            dismissButton = {
                TextButton(onClick = { showReset = false }) {
                    Text("Annuler")
                }
            }
        )
    }
}