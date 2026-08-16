package com.pastoral.tool.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.AppSettings
import com.pastoral.tool.domain.Profile
import com.pastoral.tool.ui.navigation.HomeRoute
import com.pastoral.tool.ui.screens.pinlock.sha256

@Composable
fun SettingsScreen(app: FaithApp, navController: NavHostController) {
    val settings by app.repository.settings.collectAsState()
    var showReset by remember { mutableStateOf(false) }
    var showPinSetup by remember { mutableStateOf(false) }

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
            onClick = { showPinSetup = true },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Filled.Lock, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(if (settings.pinHash == null) "Définir un code PIN" else "Modifier le code PIN")
        }

        if (settings.pinHash != null) {
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedButton(
                onClick = { app.repository.saveSettings(settings.copy(pinHash = null)) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Outlined.Lock, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Supprimer le code PIN")
            }
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

    if (showPinSetup) {
        PinSetupDialog(
            onDismiss = { showPinSetup = false },
            onSave = { hash ->
                app.repository.saveSettings(settings.copy(pinHash = hash))
                showPinSetup = false
            }
        )
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

@Composable
private fun PinSetupDialog(onDismiss: () -> Unit, onSave: (String) -> Unit) {
    var pin by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Définir un code PIN") },
        text = {
            Column {
                OutlinedTextField(
                    value = pin,
                    onValueChange = {
                        if (it.length <= 6 && it.all { c -> c.isDigit() }) {
                            pin = it
                            error = null
                        }
                    },
                    label = { Text("Nouveau PIN (4-6 chiffres)") },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    isError = error != null,
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = confirm,
                    onValueChange = {
                        if (it.length <= 6 && it.all { c -> c.isDigit() }) {
                            confirm = it
                            error = null
                        }
                    },
                    label = { Text("Confirmer le PIN") },
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    isError = error != null,
                    supportingText = { error?.let { Text(it) } },
                    singleLine = true,
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                when {
                    pin.length < 4 -> error = "Le PIN doit faire au moins 4 chiffres"
                    pin != confirm -> error = "Les codes ne correspondent pas"
                    else -> onSave(pin.sha256())
                }
            }) {
                Text("Enregistrer")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Annuler")
            }
        }
    )
}