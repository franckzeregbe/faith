package com.pastoral.tool.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.Profile

@Composable
fun ProfileScreen(app: FaithApp) {
    val profile by app.repository.profile.collectAsState()
    var name by remember { mutableStateOf(profile.name) }
    var role by remember { mutableStateOf(profile.role) }
    var church by remember { mutableStateOf(profile.church) }
    var slogan by remember { mutableStateOf(profile.slogan ?: "") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Profil pastoral", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nom") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = role,
            onValueChange = { role = it },
            label = { Text("Rôle") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = church,
            onValueChange = { church = it },
            label = { Text("Église") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )
        OutlinedTextField(
            value = slogan,
            onValueChange = { slogan = it },
            label = { Text("Slogan") },
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                app.repository.saveProfile(
                    Profile(
                        name = name,
                        role = role,
                        church = church,
                        slogan = slogan.takeIf { it.isNotBlank() }
                    )
                )
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Enregistrer")
        }
    }
}
