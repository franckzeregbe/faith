package com.pastoral.tool.data.bible

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class BibleBookDto(
    val name: String = "",
    val abbrev: String = "",
    val chapters: List<List<String>> = emptyList()
)

data class BibleBook(
    val name: String,
    val abbrev: String,
    val chapters: List<List<String>>
)

data class BibleResult(
    val ref: String,
    val book: String,
    val text: String
)

object BibleRepository {
    private val json = Json { ignoreUnknownKeys = true }
    private var cache: List<BibleBook>? = null
    private var flatCache: List<BibleResult>? = null

    private val frenchNames = mapOf(
        "Genesis" to "Genèse", "Exodus" to "Exode", "Leviticus" to "Lévitique", "Numbers" to "Nombres",
        "Deuteronomy" to "Deutéronome", "Joshua" to "Josué", "Judges" to "Juges", "Ruth" to "Ruth",
        "1 Samuel" to "1 Samuel", "2 Samuel" to "2 Samuel", "1 Kings" to "1 Rois", "2 Kings" to "2 Rois",
        "1 Chronicles" to "1 Chroniques", "2 Chronicles" to "2 Chroniques", "Ezra" to "Esdras",
        "Nehemiah" to "Néhémie", "Esther" to "Esther", "Job" to "Job", "Psalms" to "Psaumes",
        "Proverbs" to "Proverbes", "Ecclesiastes" to "Ecclésiaste", "Song of Solomon" to "Cantique des Cantiques",
        "Isaiah" to "Ésaïe", "Jeremiah" to "Jérémie", "Lamentations" to "Lamentations", "Ezekiel" to "Ézéchiel",
        "Daniel" to "Daniel", "Hosea" to "Osée", "Joel" to "Joël", "Amos" to "Amos", "Obadiah" to "Abdias",
        "Jonah" to "Jonas", "Micah" to "Michée", "Nahum" to "Nahum", "Habakkuk" to "Habacuc",
        "Zephaniah" to "Sophonie", "Haggai" to "Aggée", "Zechariah" to "Zacharie", "Malachi" to "Malachie",
        "Matthew" to "Matthieu", "Mark" to "Marc", "Luke" to "Luc", "John" to "Jean", "Acts" to "Actes",
        "Romans" to "Romains", "1 Corinthians" to "1 Corinthiens", "2 Corinthians" to "2 Corinthiens",
        "Galatians" to "Galates", "Ephesians" to "Éphésiens", "Philippians" to "Philippiens",
        "Colossians" to "Colossiens", "1 Thessalonians" to "1 Thessaloniciens", "2 Thessalonians" to "2 Thessaloniciens",
        "1 Timothy" to "1 Timothée", "2 Timothy" to "2 Timothée", "Titus" to "Tite", "Philemon" to "Philémon",
        "Hebrews" to "Hébreux", "James" to "Jacques", "1 Peter" to "1 Pierre", "2 Peter" to "2 Pierre",
        "1 John" to "1 Jean", "2 John" to "2 Jean", "3 John" to "3 Jean", "Jude" to "Jude",
        "Revelation" to "Apocalypse"
    )

    suspend fun load(context: Context): List<BibleBook> {
        cache?.let { return it }
        return withContext(Dispatchers.IO) {
            val books = context.assets.open("bible_fr.json").use { input ->
                val text = input.bufferedReader(Charsets.UTF_8).use { it.readText() }
                val dto = json.decodeFromString<List<BibleBookDto>>(text)
                dto.filter { it.name.isNotBlank() && it.chapters.isNotEmpty() }
                    .map { book ->
                        BibleBook(
                            name = frenchNames[book.name] ?: book.name,
                            abbrev = book.abbrev,
                            chapters = book.chapters
                        )
                    }
            }
            cache = books
            books
        }
    }

    suspend fun loadFlat(context: Context): List<BibleResult> {
        flatCache?.let { return it }
        val books = load(context)
        val flat = mutableListOf<BibleResult>()
        books.forEach { book ->
            book.chapters.forEachIndexed { chapterIndex, verses ->
                verses.forEachIndexed { verseIndex, text ->
                    flat.add(
                        BibleResult(
                            ref = "${book.name} ${chapterIndex + 1}:${verseIndex + 1}",
                            book = book.name,
                            text = text
                        )
                    )
                }
            }
        }
        flatCache = flat
        return flat
    }
}