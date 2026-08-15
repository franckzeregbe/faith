package com.pastoral.tool.ui.navigation

data class DrawerSection(val label: String, val items: List<DrawerItem>)
data class DrawerItem(val route: Any, val label: String, val icon: String)

val drawerSections = listOf(
    DrawerSection(
        label = "Général",
        items = listOf(
            DrawerItem(HomeRoute, "Accueil", "🏠"),
            DrawerItem(ProfileRoute, "Profil", "👤")
        )
    ),
    DrawerSection(
        label = "Ministère",
        items = listOf(
            DrawerItem(VisitsRoute, "Visites", "📋"),
            DrawerItem(CultsRoute, "Cultes", "⛪"),
            DrawerItem(ContactsRoute, "Contacts", "👥"),
            DrawerItem(ConvertsRoute, "Âmes", "🧑"),
            DrawerItem(PrayersRoute, "Prières", "🙏")
        )
    ),
    DrawerSection(
        label = "Contenu",
        items = listOf(
            DrawerItem(SermonsRoute, "Prédications", "📖"),
            DrawerItem(MessagesRoute, "Inspiration", "✉️"),
            DrawerItem(BibleRoute, "Bible", "📜")
        )
    ),
    DrawerSection(
        label = "Système",
        items = listOf(
            DrawerItem(SettingsRoute, "Paramètres", "⚙️")
        )
    )
)

val drawerItems = drawerSections.flatMap { it.items }
