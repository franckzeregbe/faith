package com.pastoral.tool.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Article
import androidx.compose.material.icons.automirrored.outlined.Article
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Church
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.AccountCircle
import androidx.compose.material.icons.outlined.Church
import androidx.compose.material.icons.outlined.DateRange
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.PersonAdd
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.ui.graphics.vector.ImageVector

data class DrawerSection(
    val label: String,
    val items: List<DrawerItem>,
    val expandable: Boolean = true,
    val defaultExpanded: Boolean = false
)
data class DrawerItem(
    val route: Any,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector
)

val drawerSections = listOf(
    DrawerSection(
        label = "Général",
        items = listOf(
            DrawerItem(HomeRoute, "Accueil", Icons.Outlined.Home, Icons.Filled.Home),
            DrawerItem(ProfileRoute, "Profil", Icons.Outlined.AccountCircle, Icons.Filled.AccountCircle)
        ),
        expandable = false
    ),
    DrawerSection(
        label = "Ministère",
        items = listOf(
            DrawerItem(VisitsRoute, "Visites", Icons.Outlined.DateRange, Icons.Filled.DateRange),
            DrawerItem(CultsRoute, "Cultes", Icons.Outlined.Church, Icons.Filled.Church),
            DrawerItem(ContactsRoute, "Contacts", Icons.Outlined.Person, Icons.Filled.Person),
            DrawerItem(ConvertsRoute, "Âmes", Icons.Outlined.PersonAdd, Icons.Filled.PersonAdd),
            DrawerItem(PrayersRoute, "Prières", Icons.Outlined.FavoriteBorder, Icons.Filled.Favorite)
        )
    ),
    DrawerSection(
        label = "Contenu",
        items = listOf(
            DrawerItem(SermonsRoute, "Prédications", Icons.Outlined.Mic, Icons.Filled.Mic),
            DrawerItem(MessagesRoute, "Inspiration", Icons.AutoMirrored.Outlined.Article, Icons.AutoMirrored.Filled.Article)
        )
    ),
    DrawerSection(
        label = "Paramètres",
        items = listOf(
            DrawerItem(SettingsRoute, "Paramètres", Icons.Outlined.Settings, Icons.Filled.Settings)
        ),
        defaultExpanded = true
    )
)

val drawerItems = drawerSections.flatMap { it.items }