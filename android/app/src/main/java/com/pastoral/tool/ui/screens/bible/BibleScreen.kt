package com.pastoral.tool.ui.screens.bible

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items as gridItems
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.data.bible.BibleBook
import com.pastoral.tool.data.bible.BibleRepository
import com.pastoral.tool.data.bible.BibleResult
import com.pastoral.tool.data.export.ExportManager
import kotlinx.coroutines.delay

@Composable
fun BibleScreen(app: FaithApp) {
    val context = LocalContext.current
    val favorites by app.repository.favoriteVerses.collectAsState()

    val books by produceState<List<BibleBook>>(initialValue = emptyList()) {
        value = BibleRepository.load(context)
    }

    var selectedBook by remember { mutableStateOf<BibleBook?>(null) }
    var selectedChapter by remember { mutableStateOf<Int?>(null) }
    var query by remember { mutableStateOf("") }
    var showFavoritesOnly by remember { mutableStateOf(false) }
    var searchResults by remember { mutableStateOf<List<BibleResult>>(emptyList()) }

    LaunchedEffect(query) {
        if (query.isBlank() || query.length < 3) {
            searchResults = emptyList()
            return@LaunchedEffect
        }
        delay(250)
        val q = query.lowercase()
        val flat = BibleRepository.loadFlat(context)
        searchResults = flat.asSequence()
            .filter { it.ref.lowercase().contains(q) || it.text.lowercase().contains(q) }
            .take(60)
            .toList()
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        val currentBook = selectedBook
        when {
            currentBook != null && selectedChapter != null -> {
                BackHeader(
                    title = "${currentBook.name} ${selectedChapter}",
                    onBack = { selectedChapter = null }
                )
                Spacer(modifier = Modifier.height(8.dp))
                val verses = currentBook.chapters[selectedChapter!! - 1]
                LazyColumn {
                    itemsIndexed(verses) { index, text ->
                        val ref = "${currentBook.name} ${selectedChapter}:${index + 1}"
                        val isFav = favorites.any { it.first == ref }
                        ElevatedCard(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 5.dp),
                            shape = MaterialTheme.shapes.medium
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "${index + 1}",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.width(32.dp)
                                    )
                                    Text(
                                        text,
                                        style = MaterialTheme.typography.bodyLarge,
                                        modifier = Modifier.weight(1f)
                                    )
                                    IconButton(onClick = {
                                        if (isFav) app.repository.removeFavoriteVerse(ref)
                                        else app.repository.addFavoriteVerse(ref, text)
                                    }) {
                                        Icon(
                                            imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                            contentDescription = "Favori",
                                            tint = if (isFav) MaterialTheme.colorScheme.primary
                                            else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                                Text(
                                    ref,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = TextAlign.End,
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }
                        }
                    }
                }
            }
            currentBook != null -> {
                BackHeader(
                    title = currentBook.name,
                    onBack = { selectedBook = null }
                )
                Spacer(modifier = Modifier.height(12.dp))
                val chapters = currentBook.chapters.indices.map { it + 1 }
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 52.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    gridItems(chapters) { chapter ->
                        Card(
                            onClick = { selectedChapter = chapter },
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceContainer
                            )
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 18.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    chapter.toString(),
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
            else -> {
                Text("Lecture biblique", style = MaterialTheme.typography.headlineMedium)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text("Rechercher (livre, chapitre, verset...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    trailingIcon = {
                        if (query.isNotBlank()) {
                            IconButton(onClick = { query = "" }) {
                                Icon(Icons.Default.Close, contentDescription = "Effacer")
                            }
                        }
                    },
                    shape = MaterialTheme.shapes.medium,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = !showFavoritesOnly,
                        onClick = { showFavoritesOnly = false },
                        label = { Text("Tous") }
                    )
                    FilterChip(
                        selected = showFavoritesOnly,
                        onClick = { showFavoritesOnly = true },
                        label = { Text("Favoris") },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Filled.Favorite,
                                contentDescription = null,
                                tint = if (showFavoritesOnly) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text("${books.size} livres · ${searchResults.size} résultat(s)", style = MaterialTheme.typography.bodySmall)

                when {
                    showFavoritesOnly -> {
                        LazyColumn {
                            if (favorites.isEmpty()) {
                                item { EmptyState("Aucun favori. Touchez le cœur d'un verset pour l'ajouter.") }
                            } else {
                                items(favorites) { (ref, text) ->
                                    FavoriteCard(ref = ref, text = text, onRemove = { app.repository.removeFavoriteVerse(ref) })
                                }
                            }
                        }
                    }
                    searchResults.isNotEmpty() -> {
                        LazyColumn {
                            item {
                                Text(
                                    "Résultats de recherche",
                                    style = MaterialTheme.typography.titleMedium,
                                    modifier = Modifier.padding(vertical = 4.dp)
                                )
                            }
                            items(searchResults) { result ->
                                ResultCard(
                                    result = result,
                                    isFav = favorites.any { it.first == result.ref },
                                    onToggleFav = {
                                        if (favorites.any { it.first == result.ref }) {
                                            app.repository.removeFavoriteVerse(result.ref)
                                        } else {
                                            app.repository.addFavoriteVerse(result.ref, result.text)
                                        }
                                    }
                                )
                            }
                        }
                    }
                    books.isEmpty() -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }
                    else -> {
                        LazyColumn {
                            item {
                                Text(
                                    "Ancien Testament",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(vertical = 6.dp)
                                )
                            }
                            items(books.take(39)) { book ->
                                BookRow(book = book, onClick = { selectedBook = book })
                            }
                            item {
                                Text(
                                    "Nouveau Testament",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(vertical = 6.dp)
                                )
                            }
                            items(books.drop(39)) { book ->
                                BookRow(book = book, onClick = { selectedBook = book })
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BackHeader(title: String, onBack: () -> Unit) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour")
        }
        Text(
            title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
private fun BookRow(book: BibleBook, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainer
        )
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.MenuBook,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(14.dp))
            Text(
                book.name,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.weight(1f)
            )
            Text(
                "${book.chapters.size} ch.",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun FavoriteCard(ref: String, text: String, onRemove: () -> Unit) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    ref,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                IconButton(onClick = onRemove) {
                    Icon(
                        imageVector = Icons.Filled.Favorite,
                        contentDescription = "Retirer des favoris",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Justify
            )
        }
    }
}

@Composable
private fun ResultCard(
    result: BibleResult,
    isFav: Boolean,
    onToggleFav: () -> Unit
) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    result.ref,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onToggleFav) {
                    Icon(
                        imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favori",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
            Text(
                result.text,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Justify
            )
        }
    }
}

@Composable
private fun EmptyState(message: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Outlined.Search,
            contentDescription = null,
            modifier = Modifier.size(40.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}