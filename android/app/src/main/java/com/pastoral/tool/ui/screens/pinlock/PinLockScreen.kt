package com.pastoral.tool.ui.screens.pinlock

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import java.security.MessageDigest

fun String.sha256(): String {
    val md = MessageDigest.getInstance("SHA-256")
    val digest = md.digest(toByteArray())
    return digest.fold("") { str, it -> str + "%02x".format(it) }
}

@Composable
fun PinLockScreen(
    expectedHash: String?,
    onUnlock: () -> Unit,
    onSetPin: (String) -> Unit
) {
    var pin by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = if (expectedHash == null) "Créer un code PIN" else "Entrez votre code PIN",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(24.dp))
        OutlinedTextField(
            value = pin,
            onValueChange = {
                if (it.length <= 6 && it.all { c -> c.isDigit() }) {
                    pin = it
                    error = null
                }
            },
            label = { Text("PIN") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            isError = error != null,
            supportingText = { error?.let { Text(it) } },
            singleLine = true
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                if (pin.length < 4) {
                    error = "Le PIN doit faire au moins 4 chiffres"
                    return@Button
                }
                val hash = pin.sha256()
                if (expectedHash == null) {
                    onSetPin(hash)
                    onUnlock()
                } else if (hash == expectedHash) {
                    onUnlock()
                } else {
                    error = "PIN incorrect"
                    pin = ""
                }
            }
        ) {
            Text(if (expectedHash == null) "Enregistrer" else "Déverrouiller")
        }
    }
}
