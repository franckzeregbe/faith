package com.pastoral.tool.ui.screens.bible

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.pastoral.tool.FaithApp

private data class BibleVerse(val ref: String, val text: String, val book: String)

private val allVerses = listOf(
    BibleVerse("Genèse 1:1", "Au commencement, Dieu créa les cieux et la terre.", "Genèse"),
    BibleVerse("Psaumes 23:1", "L'Éternel est mon berger : je ne manquerai de rien.", "Psaumes"),
    BibleVerse("Psaumes 46:1", "Dieu est notre refuge et notre force, un secours qui ne manque jamais dans la détresse.", "Psaumes"),
    BibleVerse("Psaumes 119:105", "Ta parole est une lampe à mes pieds, une lumière sur mon sentier.", "Psaumes"),
    BibleVerse("Proverbes 3:5", "Confie-toi en l'Éternel de tout ton cœur et ne t'appuie pas sur ton intelligence.", "Proverbes"),
    BibleVerse("Proverbes 3:6", "Reconnais-le dans toutes tes voies, et il aplanira tes sentiers.", "Proverbes"),
    BibleVerse("Ésaïe 40:31", "Mais ceux qui se confient en l'Éternel renouvellent leur force.", "Ésaïe"),
    BibleVerse("Ésaïe 41:10", "Ne crains point, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.", "Ésaïe"),
    BibleVerse("Jérémie 29:11", "Car je connais les projets que j'ai formés sur vous, projets de paix et non de malheur.", "Jérémie"),
    BibleVerse("Matthieu 5:16", "Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres.", "Matthieu"),
    BibleVerse("Matthieu 6:33", "Cherchez premièrement le royaume et la justice de Dieu, et toutes ces choses vous seront données par-dessus.", "Matthieu"),
    BibleVerse("Matthieu 11:28", "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.", "Matthieu"),
    BibleVerse("Marc 10:27", "Pour les hommes, c'est impossible, mais pas pour Dieu : tout est possible pour Dieu.", "Marc"),
    BibleVerse("Marc 11:24", "C'est pourquoi je vous dis : Tout ce que vous demanderez en priant, croyez que vous l'avez reçu, et vous le verrez s'accomplir.", "Marc"),
    BibleVerse("Jean 3:16", "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point.", "Jean"),
    BibleVerse("Jean 8:12", "Je suis la lumière du monde. Celui qui me suit ne marchera pas dans les ténèbres.", "Jean"),
    BibleVerse("Jean 14:6", "Je suis le chemin, la vérité et la vie. Nul ne vient au Père que par moi.", "Jean"),
    BibleVerse("Jean 14:27", "Je vous laisse la paix, je vous donne ma paix.", "Jean"),
    BibleVerse("Jean 15:5", "Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit.", "Jean"),
    BibleVerse("Romains 5:8", "Mais Dieu prouve son amour envers nous en ce que, alors que nous étions encore des pécheurs, Christ est mort pour nous.", "Romains"),
    BibleVerse("Romains 8:28", "Nous savons que toutes choses concourent au bien de ceux qui aiment Dieu.", "Romains"),
    BibleVerse("Romains 8:38-39", "Car j'ai l'assurance que ni la mort ni la vie ne pourront nous séparer de l'amour de Dieu.", "Romains"),
    BibleVerse("Romains 12:2", "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence.", "Romains"),
    BibleVerse("1 Corinthiens 13:4-5", "L'amour est patient, il est plein de bonté ; l'amour n'est pas envieux ; il ne se vante pas, il ne s'enfle pas d'orgueil.", "1 Corinthiens"),
    BibleVerse("2 Corinthiens 5:7", "Car nous marchons par la foi, non par la vue.", "2 Corinthiens"),
    BibleVerse("Galates 5:22-23", "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la foi, la douceur, la maîtrise de soi.", "Galates"),
    BibleVerse("Éphésiens 2:8", "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.", "Éphésiens"),
    BibleVerse("Éphésiens 3:20", "Or, à celui qui peut faire infiniment au-delà de tout ce que nous demandons ou pensons, selon la puissance qui agit en nous.", "Éphésiens"),
    BibleVerse("Philippiens 4:6", "Ne vous inquiétez de rien, mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications.", "Philippiens"),
    BibleVerse("Philippiens 4:7", "Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées.", "Philippiens"),
    BibleVerse("Philippiens 4:13", "Je puis tout par celui qui me fortifie.", "Philippiens"),
    BibleVerse("Colossiens 3:23", "Faites de bon cœur ce que vous faites, comme pour le Seigneur et non pour des hommes.", "Colossiens"),
    BibleVerse("Hébreux 11:1", "Or la foi est la garantie des choses qu'on espère, la conviction de celles qu'on ne voit pas.", "Hébreux"),
    BibleVerse("Hébreux 13:8", "Jésus-Christ est le même hier, aujourd'hui et éternellement.", "Hébreux"),
    BibleVerse("Jacques 1:2-3", "Mes frères, regardez comme un sujet de joie complète les diverses épreuves auxquelles vous pouvez être exposés.", "Jacques"),
    BibleVerse("Jacques 1:5", "Si quelqu'un d'entre vous manque de sagesse, qu'il la demande à Dieu qui donne à tous simplement et sans reproche.", "Jacques"),
    BibleVerse("1 Pierre 5:7", "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.", "1 Pierre"),
    BibleVerse("1 Jean 1:9", "Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner et pour nous purifier de toute iniquité.", "1 Jean"),
    BibleVerse("1 Jean 4:18", "La crainte n'est pas dans l'amour, mais l'amour parfait bannit la crainte.", "1 Jean"),
    BibleVerse("1 Jean 4:19", "Nous l'aimons, parce qu'il nous a aimés le premier.", "1 Jean"),
    BibleVerse("Apocalypse 21:4", "Il essuiera toute larme de leurs yeux, et la mort ne sera plus. Il n'y aura plus ni deuil, ni cri, ni douleur.", "Apocalypse")
)

@Composable
fun BibleScreen(app: FaithApp) {
    val favorites by app.repository.favoriteVerses.collectAsState()
    var query by remember { mutableStateOf("") }
    var showFavoritesOnly by remember { mutableStateOf(false) }

    val displayed = remember(query, showFavoritesOnly, favorites) {
        val base = if (showFavoritesOnly) {
            allVerses.filter { v -> favorites.any { it.first == v.ref } }
        } else {
            allVerses
        }
        if (query.isBlank()) base else base.filter {
            it.ref.contains(query, ignoreCase = true) ||
                    it.text.contains(query, ignoreCase = true) ||
                    it.book.contains(query, ignoreCase = true)
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Lecture biblique", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Rechercher un verset...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
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
                label = { Text("Favoris ❤️") }
            )
        }

        Spacer(modifier = Modifier.height(8.dp))
        Text("${displayed.size} verset(s)", style = MaterialTheme.typography.bodySmall)

        LazyColumn {
            items(displayed) { verse ->
                val isFav = favorites.any { it.first == verse.ref }
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                verse.ref,
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.primary
                            )
                            IconButton(onClick = {
                                if (isFav) app.repository.removeFavoriteVerse(verse.ref)
                                else app.repository.addFavoriteVerse(verse.ref, verse.text)
                            }) {
                                Icon(
                                    imageVector = if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                    contentDescription = "Favori",
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            verse.text,
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Justify
                        )
                    }
                }
            }
        }
    }
}
