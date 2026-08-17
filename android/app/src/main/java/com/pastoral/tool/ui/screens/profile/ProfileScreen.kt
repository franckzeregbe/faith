package com.pastoral.tool.ui.screens.profile

import android.content.ContentResolver
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import kotlinx.coroutines.launch
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.FormatQuote
import androidx.compose.material.icons.outlined.LocationCity
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Work
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.domain.Profile
import com.pastoral.tool.ui.theme.FaithGradientEnd
import com.pastoral.tool.ui.theme.FaithGradientMid
import com.pastoral.tool.ui.theme.FaithGradientStart
import java.io.File
import java.io.FileOutputStream

@Composable
fun ProfileAvatar(
    profile: Profile,
    modifier: Modifier = Modifier,
    size: Dp = 56.dp,
    backgroundColor: Color = Color.White
) {
    val context = LocalContext.current
    val initials = remember(profile.name) {
        profile.name.trim()
            .split(Regex("\\s+"))
            .filter { it.isNotBlank() }
            .take(2)
            .joinToString("") { it.first().uppercase() }
    }
    val imageBitmap: ImageBitmap? = remember(profile.photoUri) {
        profile.photoUri?.let { path ->
            try {
                BitmapFactory.decodeFile(path)?.asImageBitmap()
            } catch (e: Exception) {
                null
            }
        }
    }

    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(backgroundColor)
            .background(backgroundColor.copy(alpha = 0.28f)),
        contentAlignment = Alignment.Center
    ) {
        if (imageBitmap != null) {
            Image(
                painter = BitmapPainter(imageBitmap),
                contentDescription = "Photo de profil",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape)
            )
        } else if (initials.isNotBlank()) {
            Text(
                initials,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        } else {
            Icon(
                Icons.Outlined.Person,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(size * 0.45f)
            )
        }
    }
}

@Composable
fun ProfileScreen(app: FaithApp) {
    val profile by app.repository.profile.collectAsState()
    var name by remember { mutableStateOf(profile.name) }
    var role by remember { mutableStateOf(profile.role) }
    var church by remember { mutableStateOf(profile.church) }
    var slogan by remember { mutableStateOf(profile.slogan ?: "") }

    val context = LocalContext.current
    val resolver: ContentResolver = context.contentResolver

    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            try {
                resolver.openInputStream(it)?.use { input ->
                    val bmp = BitmapFactory.decodeStream(input)
                    val file = File(context.filesDir, "profile.png")
                    FileOutputStream(file).use { out ->
                        bmp.compress(Bitmap.CompressFormat.PNG, 96, out)
                    }
                    app.repository.saveProfile(
                        Profile(
                            name = name,
                            role = role,
                            church = church,
                            photoUri = file.absolutePath,
                            slogan = slogan.takeIf { it.isNotBlank() }
                        )
                    )
                }
            } catch (e: Exception) {
            }
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        contentWindowInsets = WindowInsets(0, 0, 0, 0)
    ) { _ ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .imePadding()
                .padding(16.dp)
        ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(MaterialTheme.shapes.large)
                .background(
                    Brush.horizontalGradient(
                        listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd)
                    )
                )
                .padding(20.dp)
        ) {
            Text(
                "Profil pastoral",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White
            )
        }
        Spacer(modifier = Modifier.height(16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            ProfileAvatar(
                profile = profile,
                size = 64.dp,
                backgroundColor = Color.White
            )
            Spacer(modifier = Modifier.width(12.dp))
            IconButton(
                onClick = { photoPicker.launch("image/*") },
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    Icons.Outlined.Edit,
                    contentDescription = "Changer la photo de profil",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))

        ElevatedCard(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nom") },
                    leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null) },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = role,
                    onValueChange = { role = it },
                    label = { Text("Rôle") },
                    leadingIcon = { Icon(Icons.Outlined.Work, contentDescription = null) },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = church,
                    onValueChange = { church = it },
                    label = { Text("Église") },
                    leadingIcon = { Icon(Icons.Outlined.LocationCity, contentDescription = null) },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
                OutlinedTextField(
                    value = slogan,
                    onValueChange = { slogan = it },
                    label = { Text("Slogan") },
                    leadingIcon = { Icon(Icons.Outlined.FormatQuote, contentDescription = null) },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = {
                app.repository.saveProfile(
                    Profile(
                        name = name,
                        role = role,
                        church = church,
                        photoUri = profile.photoUri,
                        slogan = slogan.takeIf { it.isNotBlank() }
                    )
                )
                scope.launch { snackbarHostState.showSnackbar("Profil enregistré") }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Filled.Check, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Enregistrer")
        }
        }
    }
}
