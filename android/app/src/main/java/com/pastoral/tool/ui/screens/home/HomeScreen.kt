package com.pastoral.tool.ui.screens.home

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.outlined.Article
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.WavingHand
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import com.pastoral.tool.FaithApp
import com.pastoral.tool.R
import com.pastoral.tool.data.export.ExportManager
import com.pastoral.tool.ui.navigation.*
import com.pastoral.tool.ui.screens.bible.allVerses
import com.pastoral.tool.ui.screens.profile.ProfileAvatar
import com.pastoral.tool.ui.theme.FaithGradientEnd
import com.pastoral.tool.ui.theme.FaithGradientMid
import com.pastoral.tool.ui.theme.FaithGradientStart
import java.util.Calendar

private data class StatItem(val label: String, val value: String, val icon: ImageVector, val color: Color)

@Composable
private fun StatsDonutChart(stats: List<StatItem>) {
    val total = stats.sumOf { it.value.toInt() }
    val progress by animateFloatAsState(
        targetValue = 1f,
        animationSpec = androidx.compose.animation.core.tween(900, easing = FastOutSlowInEasing),
        label = "donut"
    )

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.large,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer
        )
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(190.dp),
                contentAlignment = Alignment.Center
            ) {
                val trackColor = MaterialTheme.colorScheme.surfaceContainerHigh
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val stroke = 28.dp.toPx()
                    val diameter = minOf(size.width, size.height) - stroke * 2
                    val topLeft = Offset((size.width - diameter) / 2f, (size.height - diameter) / 2f)
                    val arcSize = Size(diameter, diameter)

                    drawArc(
                        color = trackColor,
                        startAngle = 0f,
                        sweepAngle = 360f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = arcSize,
                        style = Stroke(width = stroke)
                    )

                    if (total > 0) {
                        var startAngle = -90f
                        stats.forEach { item ->
                            val count = item.value.toInt()
                            if (count > 0) {
                                val sweep = 360f * count / total
                                drawArc(
                                    color = item.color,
                                    startAngle = startAngle,
                                    sweepAngle = sweep * progress,
                                    useCenter = false,
                                    topLeft = topLeft,
                                    size = arcSize,
                                    style = Stroke(width = stroke, cap = StrokeCap.Round)
                                )
                                startAngle += sweep
                            }
                        }
                    }
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        total.toString(),
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        "éléments",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            stats.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(item.color)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        item.label,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        item.value,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

@Composable
private fun QuickAccessCard(
    label: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer
        )
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.16f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Text(
                label,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.weight(1f)
            )
            Icon(
                imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
fun HomeScreen(app: FaithApp, navController: NavHostController) {
    val context = LocalContext.current
    val profile by app.repository.profile.collectAsState()
    val visits by app.repository.visits.collectAsState()
    val contacts by app.repository.contacts.collectAsState()
    val cults by app.repository.cults.collectAsState()
    val converts by app.repository.converts.collectAsState()
    val prayers by app.repository.prayers.collectAsState()
    val sermons by app.repository.sermons.collectAsState()

    val primary = MaterialTheme.colorScheme.primary
    val secondary = MaterialTheme.colorScheme.secondary
    val tertiary = MaterialTheme.colorScheme.tertiary

    val stats = listOf(
        StatItem("Visites", visits.size.toString(), Icons.Outlined.DateRange, primary),
        StatItem("Contacts", contacts.size.toString(), Icons.Outlined.Person, secondary),
        StatItem("Cultes", cults.size.toString(), Icons.Outlined.Groups, tertiary),
        StatItem("Âmes", converts.size.toString(), Icons.Outlined.FavoriteBorder, Color(0xFF2F6B4F)),
        StatItem("Prières", prayers.size.toString(), Icons.Outlined.WavingHand, Color(0xFF2C6E9C)),
        StatItem("Prédications", sermons.size.toString(), Icons.Outlined.Mic, Color(0xFF7A4E9C))
    )

    val verse = remember {
        val dayOfYear = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
        allVerses[(dayOfYear - 1) % allVerses.size]
    }

    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(MaterialTheme.shapes.large)
                    .background(
                        Brush.horizontalGradient(listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd))
                    )
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ProfileAvatar(
                        profile = profile,
                        size = 56.dp,
                        backgroundColor = Color.White
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            if (profile.name.isBlank()) "Bienvenue !" else "Bienvenue, ${profile.name} !",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                        if (profile.role.isNotBlank()) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                profile.role,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White.copy(alpha = 0.9f)
                            )
                        }
                        if (profile.church.isNotBlank()) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                profile.church,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.large,
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.verticalGradient(listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd))
                        )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Verset du jour",
                                style = MaterialTheme.typography.labelMedium,
                                color = Color.White.copy(alpha = 0.9f)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                verse.text,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                maxLines = 3,
                                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                verse.ref,
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White.copy(alpha = 0.85f)
                            )
                        }
                        IconButton(
                            onClick = {
                                ExportManager.shareText(context, "Verset du jour", "${verse.ref}\n${verse.text}")
                            },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = "Partager",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }

        item {
            Text("Accès rapide", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))

            val quickItems: List<Pair<Any, Triple<String, ImageVector, Color>>> = listOf(
                VisitsRoute to Triple("Visites", Icons.Outlined.DateRange, primary),
                ContactsRoute to Triple("Contacts", Icons.Outlined.Person, secondary),
                MessagesRoute to Triple("Inspiration", Icons.AutoMirrored.Outlined.Article, tertiary),
                BibleRoute to Triple("Bible", Icons.AutoMirrored.Outlined.MenuBook, Color(0xFF2F6B4F))
            )

            quickItems.forEach { (route, item) ->
                QuickAccessCard(
                    label = item.first,
                    icon = item.second,
                    color = item.third,
                    onClick = { navController.navigate(route) }
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        item {
            Text("Statistiques", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            StatsDonutChart(stats)
        }
    }
}