package com.pastoral.tool.ui.screens.bible

import com.pastoral.tool.data.export.ExportManager
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items as gridItems
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.automirrored.outlined.HelpOutline
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pastoral.tool.FaithApp
import com.pastoral.tool.data.bible.BibleBook
import com.pastoral.tool.data.bible.BibleReference
import com.pastoral.tool.data.bible.BibleReferenceParser
import com.pastoral.tool.data.bible.BibleRepository
import com.pastoral.tool.data.bible.BibleResult
import kotlinx.coroutines.delay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Versets populaires pour les chips de raccourci. Le parser accepte les abréviations. */
private val SUGGESTED_VERSES = listOf(
    "Jean 3:16",
    "Psaumes 23",
    "Romains 8:28",
    "Philippiens 4:13",
    "Apocalypse 21:4"
)

@Composable
fun BibleScreen(app: FaithApp) {
    val context = LocalContext.current
    val favorites by app.repository.favoriteVerses.collectAsState()

    val books by produceState<List<BibleBook>?>(initialValue = null) {
        value = try {
            BibleRepository.load(context)
        } catch (e: Exception) {
            null
        }
    }

    var selectedBookIndex by remember { mutableStateOf<Int?>(null) }
    var selectedChapter by remember { mutableStateOf<Int?>(null) }
    var pendingVerse by remember { mutableStateOf<Pair<Int, Int>?>(null) } // verset ciblé après navigation
    var query by remember { mutableStateOf("") }
    var showFavoritesOnly by remember { mutableStateOf(false) }
    var searchResults by remember { mutableStateOf<List<BibleResult>>(emptyList()) }
    var referenceError by remember { mutableStateOf<String?>(null) }

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

    LaunchedEffect(books != null) {
        if (books != null) {
            withContext(Dispatchers.IO) { BibleRepository.loadFlat(context) }
        }
    }

    val loadedBooks = books
    val currentBook = loadedBooks?.getOrNull(selectedBookIndex ?: -1)

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        when {
            currentBook != null && selectedChapter != null -> {
                val chapterVerses = remember(currentBook, selectedChapter) {
                    currentBook.chapters.getOrNull(selectedChapter!! - 1).orEmpty()
                }
                val chapterCount = currentBook.chapters.size
                val ch = selectedChapter!!
                BackHeader(
                    title = "${currentBook.name} $ch",
                    onBack = { selectedChapter = null; pendingVerse = null },
                    onPrev = { if (ch > 1) { selectedChapter = ch - 1; pendingVerse = null } },
                    onNext = { if (ch < chapterCount) { selectedChapter = ch + 1; pendingVerse = null } },
                    canPrev = ch > 1,
                    canNext = ch < chapterCount
                )
                Spacer(modifier = Modifier.height(8.dp))
                VerseList(
                    chapterVerses = chapterVerses,
                    bookName = currentBook.name,
                    chapter = ch,
                    favorites = favorites,
                    app = app,
                    pendingVerse = pendingVerse,
                    onPendingConsumed = { pendingVerse = null },
                    queryHighlight = null
                )
            }
            currentBook != null -> {
                BackHeader(
                    title = currentBook.name,
                    onBack = { selectedBookIndex = null }
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
                AnimatedContent(
                    targetState = showFavoritesOnly,
                    transitionSpec = {
                        (fadeIn(tween(220)) + slideInHorizontally(tween(220)) { it / 8 })
                            .togetherWith(fadeOut(tween(180)) + slideOutHorizontally(tween(180)) { -it / 8 })
                    },
                    label = "bible-home"
                ) { favoritesOnly ->
                    Column {
                        Text(
                            "Lecture biblique",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        ReferenceField(
                            query = query,
                            onQueryChange = {
                                query = it
                                referenceError = null
                            },
                            onSubmit = {
                                navigateFromQuery(it, loadedBooks) { bookIdx, chap, v1 ->
                                    selectedBookIndex = bookIdx
                                    selectedChapter = chap
                                    pendingVerse = v1?.let { it to it }
                                    query = ""
                                    referenceError = null
                                } ?: run {
                                    referenceError = "Référence introuvable. Essaie « Jean 3:16 » ou « Psaumes 23 »."
                                }
                            },
                            errorText = referenceError
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
                                        else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            )
                        }
                        if (!favoritesOnly && query.isBlank()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                "Accès rapide",
                                style = MaterialTheme.typography.labelLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(start = 4.dp, bottom = 6.dp)
                            )
                            // Chips horizontales scrollables (chips Material 3 via AssistChip)
                            androidx.compose.foundation.lazy.LazyRow(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                contentPadding = PaddingValues(horizontal = 2.dp)
                            ) {
                                items(SUGGESTED_VERSES) { verse ->
                                    AssistChip(
                                        onClick = {
                                            navigateFromQuery(verse, loadedBooks) { bookIdx, chap, v1 ->
                                                selectedBookIndex = bookIdx
                                                selectedChapter = chap
                                                pendingVerse = v1?.let { it to it }
                                                referenceError = null
                                            } ?: run {
                                                referenceError = "Référence « $verse » introuvable."
                                            }
                                        },
                                        label = { Text(verse, fontSize = 13.sp) },
                                        leadingIcon = {
                                            Icon(
                                                Icons.Filled.Bookmark,
                                                contentDescription = null,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        if (loadedBooks == null) {
                            EmptyState("Chargement de la Bible…")
                        } else if (favoritesOnly) {
                            if (favorites.isEmpty()) {
                                EmptyState("Aucun verset en favori pour le moment.")
                            } else {
                                LazyColumn {
                                    itemsIndexed(favorites) { _, fav ->
                                        FavoriteCard(
                                            ref = fav.first,
                                            text = fav.second,
                                            onRemove = { app.repository.removeFavoriteVerse(fav.first) }
                                        )
                                    }
                                }
                            }
                        } else if (query.isNotBlank() && searchResults.isNotEmpty()) {
                            LazyColumn {
                                itemsIndexed(searchResults) { _, r ->
                                    ResultCard(
                                        result = r,
                                        isFav = favorites.any { it.first == r.ref },
                                        onToggleFav = {
                                            if (favorites.any { it.first == r.ref })
                                                app.repository.removeFavoriteVerse(r.ref)
                                            else
                                                app.repository.addFavoriteVerse(r.ref, r.text)
                                        },
                                        highlight = query
                                    )
                                }
                            }
                        } else if (query.isNotBlank()) {
                            EmptyState("Aucun résultat pour « $query ».")
                        } else {
                            val list = loadedBooks
                            LazyColumn(modifier = Modifier.fillMaxSize()) {
                                itemsIndexed(list) { index, book ->
                                    BookRow(
                                        index = index,
                                        book = book,
                                        onClick = { selectedBookIndex = index }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Tente de transformer `input` en navigation. Retourne null si la référence n'est pas reconnue.
 * Le bloc [onResolved] reçoit (bookIndex, chapter, verseStart).
 */
private inline fun navigateFromQuery(
    input: String,
    books: List<BibleBook>?,
    onResolved: (bookIndex: Int, chapter: Int, verseStart: Int?) -> Unit
): Unit? {
    if (books == null) return null
    val ref: BibleReference = BibleReferenceParser.parse(input, books) ?: return null
    onResolved(ref.bookIndex, ref.chapter, ref.verseStart)
    return Unit
}

@Composable
private fun ReferenceField(
    query: String,
    onQueryChange: (String) -> Unit,
    onSubmit: (String) -> Unit,
    errorText: String?
) {
    val isError = errorText != null
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        label = { Text("Livre, chapitre ou verset") },
        placeholder = { Text("Ex : Jean 3:16, Psaumes 23, Gn 1 1", fontSize = 13.sp) },
        leadingIcon = { Icon(Icons.AutoMirrored.Outlined.HelpOutline, contentDescription = null) },
        trailingIcon = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (query.isNotBlank()) {
                    IconButton(onClick = { onQueryChange("") }) {
                        Icon(Icons.Default.Close, contentDescription = "Effacer")
                    }
                }
                IconButton(onClick = { onSubmit(query) }, enabled = query.isNotBlank()) {
                    Icon(Icons.Default.ArrowForward, contentDescription = "Aller à")
                }
            }
        },
        supportingText = {
            if (isError) {
                Text(errorText.orEmpty(), color = MaterialTheme.colorScheme.error)
            } else {
                Text(
                    "Référence (Jean 3:16), livre+chapitre (Psaumes 23) ou recherche libre",
                    fontSize = 12.sp
                )
            }
        },
        isError = isError,
        singleLine = true,
        shape = MaterialTheme.shapes.medium,
        modifier = Modifier.fillMaxWidth()
    )
}

@Composable
private fun VerseList(
    chapterVerses: List<String>,
    bookName: String,
    chapter: Int,
    favorites: List<Pair<String, String>>,
    app: FaithApp,
    pendingVerse: Pair<Int, Int>?,
    onPendingConsumed: () -> Unit,
    queryHighlight: String?
) {
    val context = LocalContext.current
    val listState = rememberLazyListState()
    val verseTarget = pendingVerse?.first

    LaunchedEffect(verseTarget) {
        if (verseTarget != null && verseTarget in 1..chapterVerses.size) {
            listState.animateScrollToItem(verseTarget - 1)
            onPendingConsumed()
        }
    }

    LazyColumn(state = listState) {
        itemsIndexed(chapterVerses) { index, text ->
            val verseNumber = index + 1
            val ref = "$bookName $chapter:$verseNumber"
            val isFav = favorites.any { it.first == ref }
            val isTarget = verseTarget == verseNumber
            VerseCard(
                number = verseNumber,
                ref = ref,
                text = text,
                isFav = isFav,
                isTarget = isTarget,
                onToggleFav = {
                    if (isFav) app.repository.removeFavoriteVerse(ref)
                    else app.repository.addFavoriteVerse(ref, text)
                },
                onShare = {
                    ExportManager.shareText(
                        context,
                        "Verset — $ref",
                        "$ref\n$text\n\n— Partagé depuis FAITH"
                    )
                },
                highlight = queryHighlight
            )
        }
    }
}

@Composable
private fun VerseCard(
    number: Int,
    ref: String,
    text: String,
    isFav: Boolean,
    isTarget: Boolean,
    onToggleFav: () -> Unit,
    onShare: () -> Unit,
    highlight: String?
) {
    val containerColor = if (isTarget) {
        MaterialTheme.colorScheme.primaryContainer
    } else {
        MaterialTheme.colorScheme.surfaceContainerLow
    }
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.elevatedCardColors(containerColor = containerColor)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    "$number",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.width(32.dp)
                )
                Text(
                    highlightAnnotated(text, highlight, MaterialTheme.colorScheme.tertiaryContainer),
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.weight(1f)
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    ref,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.weight(1f)
                )
                IconButton(onClick = onShare) {
                    Icon(
                        Icons.Filled.Share,
                        contentDescription = "Partager",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(20.dp)
                    )
                }
                IconButton(onClick = onToggleFav) {
                    Icon(
                        imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favori",
                        tint = if (isFav) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

/** Construit un AnnotatedString qui surligne (couleur de thème) toutes les occurrences de [query] dans [text]. */
private fun highlightAnnotated(text: String, query: String?, highlightColor: androidx.compose.ui.graphics.Color): AnnotatedString {
    if (query.isNullOrBlank() || query.length < 3) return AnnotatedString(text)
    val q = query.lowercase()
    val lc = text.lowercase()
    return buildAnnotatedString {
        var i = 0
        while (i < text.length) {
            val idx = lc.indexOf(q, i)
            if (idx < 0) {
                append(text.substring(i))
                break
            }
            append(text.substring(i, idx))
            withStyle(SpanStyle(background = highlightColor)) {
                append(text.substring(idx, idx + q.length))
            }
            i = idx + q.length
        }
    }
}

@Composable
private fun BackHeader(
    title: String,
    onBack: () -> Unit,
    onPrev: (() -> Unit)? = null,
    onNext: (() -> Unit)? = null,
    canPrev: Boolean = true,
    canNext: Boolean = true
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour au livre")
        }
        if (onPrev != null) {
            IconButton(onClick = onPrev, enabled = canPrev) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Chapitre précédent"
                )
            }
        }
        Text(
            title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.weight(1f)
        )
        if (onNext != null) {
            IconButton(onClick = onNext, enabled = canNext) {
                Icon(
                    Icons.Filled.ArrowForward,
                    contentDescription = "Chapitre suivant"
                )
            }
        }
    }
}

@Composable
private fun BookRow(index: Int, book: BibleBook, onClick: () -> Unit) {
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
            Text(
                "${index + 1}",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.width(28.dp)
            )
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
    onToggleFav: () -> Unit,
    highlight: String?
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
                highlightAnnotated(result.text, highlight, MaterialTheme.colorScheme.tertiaryContainer),
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

