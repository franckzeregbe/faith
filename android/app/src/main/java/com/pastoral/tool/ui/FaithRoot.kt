package com.pastoral.tool.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.pastoral.tool.FaithApp
import com.pastoral.tool.R
import com.pastoral.tool.ui.navigation.*
import com.pastoral.tool.ui.screens.pinlock.PinLockScreen
import com.pastoral.tool.ui.screens.home.HomeScreen
import com.pastoral.tool.ui.screens.profile.ProfileScreen
import com.pastoral.tool.ui.screens.visits.VisitsScreen
import com.pastoral.tool.ui.screens.cults.CultsScreen
import com.pastoral.tool.ui.screens.contacts.ContactsScreen
import com.pastoral.tool.ui.screens.converts.ConvertsScreen
import com.pastoral.tool.ui.screens.sermons.SermonsScreen
import com.pastoral.tool.ui.screens.messages.MessagesScreen
import com.pastoral.tool.ui.screens.bible.BibleScreen
import com.pastoral.tool.ui.screens.prayers.PrayersScreen
import com.pastoral.tool.ui.screens.settings.SettingsScreen
import com.pastoral.tool.ui.theme.FAITHTheme
import com.pastoral.tool.ui.theme.FaithGradientEnd
import com.pastoral.tool.ui.theme.FaithGradientMid
import com.pastoral.tool.ui.theme.FaithGradientStart
import kotlinx.coroutines.launch

@Composable
fun FaithRoot(app: FaithApp) {
    val settings by app.repository.settings.collectAsState()
    val ready by app.repository.ready.collectAsState()
    var unlocked by remember { mutableStateOf(false) }

    FAITHTheme(darkTheme = settings.darkMode) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            when {
                !ready -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                settings.pinHash != null && !unlocked -> {
                    PinLockScreen(
                        expectedHash = settings.pinHash,
                        onUnlock = { unlocked = true },
                        onSetPin = { newHash ->
                            app.repository.saveSettings(settings.copy(pinHash = newHash))
                        }
                    )
                }
                else -> {
                    val navController = rememberNavController()
                    MainScaffold(app = app, navController = navController)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScaffold(app: FaithApp, navController: NavHostController) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val currentLabel = drawerItems.firstOrNull { it.route::class.qualifiedName == currentRoute }?.label ?: "FAITH"

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(drawerContainerColor = MaterialTheme.colorScheme.surface) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd))
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(Color.White)
                                .padding(8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(R.drawable.logo_faith),
                                contentDescription = "Logo FAITH",
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            "FAITH",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            "Gestion pastorale",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                val expandedSections = remember { mutableStateMapOf<String, Boolean>() }
                drawerSections.forEach { section ->
                    if (section.expandable) {
                        val isExpanded = expandedSections[section.label] ?: section.defaultExpanded
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { expandedSections[section.label] = !isExpanded }
                                .padding(horizontal = 16.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = section.label,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.weight(1f)
                            )
                            Icon(
                                imageVector = Icons.Filled.KeyboardArrowDown,
                                contentDescription = if (isExpanded) "Replier la section" else "Déplier la section",
                                modifier = Modifier.rotate(if (isExpanded) 180f else 0f),
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                        AnimatedVisibility(visible = isExpanded) {
                            Column {
                                section.items.forEach { item ->
                                    val selected = currentRoute == item.route::class.qualifiedName
                                    NavigationDrawerItem(
                                        label = { Text(item.label) },
                                        icon = {
                                            Icon(
                                                imageVector = if (selected) item.selectedIcon else item.icon,
                                                contentDescription = null
                                            )
                                        },
                                        selected = selected,
                                        onClick = {
                                            navController.navigate(item.route) {
                                                popUpTo(navController.graph.startDestinationId) {
                                                    saveState = true
                                                }
                                                launchSingleTop = true
                                                restoreState = true
                                            }
                                            scope.launch { drawerState.close() }
                                        },
                                        modifier = Modifier.padding(horizontal = 12.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                            }
                        }
                    } else {
                        Text(
                            text = section.label,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                        )
                        section.items.forEach { item ->
                            val selected = currentRoute == item.route::class.qualifiedName
                            NavigationDrawerItem(
                                label = { Text(item.label) },
                                icon = {
                                    Icon(
                                        imageVector = if (selected) item.selectedIcon else item.icon,
                                        contentDescription = null
                                    )
                                },
                                selected = selected,
                                onClick = {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.startDestinationId) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                    scope.launch { drawerState.close() }
                                },
                                modifier = Modifier.padding(horizontal = 12.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(listOf(FaithGradientStart, FaithGradientMid, FaithGradientEnd))
                        )
                ) {
                    TopAppBar(
                        title = { Text(currentLabel) },
                        navigationIcon = {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(
                                    imageVector = Icons.Default.Menu,
                                    contentDescription = "Menu"
                                )
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = Color.Transparent,
                            titleContentColor = Color.White,
                            navigationIconContentColor = Color.White
                        )
                    )
                }
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = HomeRoute,
                modifier = Modifier.padding(innerPadding)
            ) {
                composable<HomeRoute> { HomeScreen(app = app, navController = navController) }
                composable<ProfileRoute> { ProfileScreen(app = app) }
                composable<VisitsRoute> { VisitsScreen(app = app) }
                composable<CultsRoute> { CultsScreen(app = app) }
                composable<ContactsRoute> { ContactsScreen(app = app) }
                composable<ConvertsRoute> { ConvertsScreen(app = app) }
                composable<SermonsRoute> { SermonsScreen(app = app) }
                composable<MessagesRoute> { MessagesScreen(app = app) }
                composable<BibleRoute> { BibleScreen(app = app) }
                composable<PrayersRoute> { PrayersScreen(app = app) }
                composable<SettingsRoute> { SettingsScreen(app = app, navController = navController) }
            }
        }
    }
}