package com.pastoral.tool.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.navigation.compose.*
import com.pastoral.tool.FaithApp
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
import kotlinx.coroutines.launch

@Composable
fun FaithRoot(app: FaithApp) {
    val settings by app.repository.settings.collectAsState()
    var unlocked by remember { mutableStateOf(settings.pinHash == null) }

    if (!unlocked) {
        PinLockScreen(
            expectedHash = settings.pinHash,
            onUnlock = { unlocked = true },
            onSetPin = { newHash ->
                app.repository.saveSettings(settings.copy(pinHash = newHash))
            }
        )
    } else {
        val navController = rememberNavController()
        MainScaffold(app = app, navController = navController)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScaffold(app: FaithApp, navController: NavHostController) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    "FAITH",
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(8.dp))
                drawerSections.forEach { section ->
                    Text(
                        text = section.label,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                    )
                    section.items.forEach { item ->
                        NavigationDrawerItem(
                            label = { Text("${item.icon}  ${item.label}") },
                            selected = currentRoute == item.route::class.qualifiedName,
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
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("FAITH") },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(
                                imageVector = Icons.Default.Menu,
                                contentDescription = "Menu"
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        titleContentColor = MaterialTheme.colorScheme.onPrimary,
                        navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
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
