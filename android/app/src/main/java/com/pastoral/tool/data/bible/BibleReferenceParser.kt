package com.pastoral.tool.data.bible

/**
 * Parser de r�f�rence biblique (pur Kotlin, testable, sans d�pendance Android).
 *
 * Formats accept�s (casse et accents tol�r�s) :
 *   - "Jean 3:16"             -> livre 3, chapitre 16
 *   - "Jean 3 16"             -> idem (espace ou deux-points)
 *   - "Jean 3:16-18"          -> plage de versets
 *   - "1 Corinthiens 13:4-7"  -> livre num�rot�
 *   - "Gn 1", "Gen 1", "Genese 1"
 *   - "Psaumes 23"
 */
object BibleReferenceParser {

    /** Abreviations courantes FR/EN, mappees vers le nom canonique anglais (cle du frenchNames). */
    private val aliases: Map<String, String> = buildMap {
        // Ancien Testament
        put("gn", "Genesis"); put("ge", "Genesis"); put("gen", "Genesis"); put("genesis", "Genesis")
        put("ex", "Exodus"); put("exo", "Exodus"); put("exode", "Exodus")
        put("lv", "Leviticus"); put("lev", "Leviticus"); put("levitique", "Leviticus")
        put("nb", "Numbers"); put("nm", "Numbers"); put("nombres", "Numbers")
        put("dt", "Deuteronomy"); put("deut", "Deuteronomy"); put("deuteronome", "Deuteronomy")
        put("jos", "Joshua"); put("josue", "Joshua")
        put("jg", "Judges"); put("juges", "Judges")
        put("rt", "Ruth")
        put("1s", "1 Samuel"); put("1 sam", "1 Samuel"); put("1samuel", "1 Samuel")
        put("2s", "2 Samuel"); put("2 sam", "2 Samuel"); put("2samuel", "2 Samuel")
        put("1r", "1 Kings"); put("1 rois", "1 Kings"); put("1rois", "1 Kings")
        put("2r", "2 Kings"); put("2 rois", "2 Kings"); put("2rois", "2 Kings")
        put("1ch", "1 Chronicles"); put("1 chr", "1 Chronicles"); put("1chroniques", "1 Chronicles")
        put("2ch", "2 Chronicles"); put("2 chr", "2 Chronicles"); put("2chroniques", "2 Chronicles")
        put("esd", "Ezra"); put("esdras", "Ezra")
        put("ne", "Nehemiah"); put("neh", "Nehemiah"); put("neh�mie", "Nehemiah"); put("nehemie", "Nehemiah")
        put("est", "Esther")
        put("job", "Job")
        put("ps", "Psalms"); put("psaumes", "Psalms"); put("pss", "Psalms")
        put("pr", "Proverbs"); put("prov", "Proverbs"); put("proverbes", "Proverbs")
        put("ec", "Ecclesiastes"); put("eccl", "Ecclesiastes"); put("ecclesiastes", "Ecclesiastes")
        put("ct", "Song of Solomon"); put("cantique", "Song of Solomon"); put("cantique des cantiques", "Song of Solomon")
        put("es", "Isaiah"); put("isa", "Isaiah"); put("esaie", "Isaiah")
        put("jr", "Jeremiah"); put("jer", "Jeremiah"); put("jeremie", "Jeremiah")
        put("lm", "Lamentations"); put("lamentations", "Lamentations")
        put("ez", "Ezekiel"); put("ezechiel", "Ezekiel")
        put("dn", "Daniel"); put("dan", "Daniel"); put("daniel", "Daniel")
        put("os", "Hosea"); put("osee", "Hosea")
        put("jl", "Joel"); put("joel", "Joel")
        put("am", "Amos")
        put("abd", "Obadiah"); put("abdias", "Obadiah")
        put("jon", "Jonah"); put("jonas", "Jonah")
        put("mi", "Micah"); put("mic", "Micah"); put("michee", "Micah")
        put("nah", "Nahum"); put("nahum", "Nahum")
        put("hab", "Habakkuk"); put("habacuc", "Habakkuk")
        put("soph", "Zephaniah"); put("sophonie", "Zephaniah")
        put("ag", "Haggai"); put("aggee", "Haggai")
        put("zac", "Zechariah"); put("zacharie", "Zechariah")
        put("mal", "Malachi"); put("malachie", "Malachi")
        // Nouveau Testament
        put("mt", "Matthew"); put("mat", "Matthew"); put("matthieu", "Matthew")
        put("mc", "Mark"); put("mar", "Mark"); put("marc", "Mark")
        put("lc", "Luke"); put("luc", "Luke"); put("lk", "Luke")
        put("jn", "John"); put("jo", "John"); put("jean", "John")
        put("ac", "Acts"); put("act", "Acts"); put("actes", "Acts")
        put("rom", "Romans"); put("rm", "Romans"); put("romains", "Romans")
        put("1co", "1 Corinthians"); put("1 cor", "1 Corinthians"); put("1cor", "1 Corinthians"); put("1corinthiens", "1 Corinthians")
        put("2co", "2 Corinthians"); put("2 cor", "2 Corinthians"); put("2cor", "2 Corinthians"); put("2corinthiens", "2 Corinthians")
        put("gal", "Galatians"); put("ga", "Galatians"); put("galates", "Galatians")
        put("eph", "Ephesians"); put("ep", "Ephesians"); put("ephesiens", "Ephesians")
        put("phil", "Philippians"); put("php", "Philippians"); put("philippiens", "Philippians")
        put("col", "Colossians"); put("colossiens", "Colossians")
        put("1th", "1 Thessalonians"); put("1 thes", "1 Thessalonians"); put("1thess", "1 Thessalonians"); put("1thessaloniciens", "1 Thessalonians")
        put("2th", "2 Thessalonians"); put("2 thes", "2 Thessalonians"); put("2thess", "2 Thessalonians"); put("2thessaloniciens", "2 Thessalonians")
        put("1tm", "1 Timothy"); put("1 tim", "1 Timothy"); put("1tim", "1 Timothy"); put("1timothee", "1 Timothy")
        put("2tm", "2 Timothy"); put("2 tim", "2 Timothy"); put("2tim", "2 Timothy"); put("2timothee", "2 Timothy")
        put("tt", "Titus"); put("tite", "Titus"); put("tit", "Titus")
        put("phm", "Philemon"); put("phlm", "Philemon"); put("philemon", "Philemon")
        put("he", "Hebrews"); put("heb", "Hebrews"); put("hebreux", "Hebrews")
        put("jc", "James"); put("ja", "James"); put("jacques", "James"); put("jam", "James")
        put("1p", "1 Peter"); put("1 pi", "1 Peter"); put("1pe", "1 Peter"); put("1pierre", "1 Peter"); put("1peter", "1 Peter")
        put("2p", "2 Peter"); put("2 pi", "2 Peter"); put("2pe", "2 Peter"); put("2pierre", "2 Peter"); put("2peter", "2 Peter")
        put("1jn", "1 John"); put("1jo", "1 John"); put("1jean", "1 John")
        put("2jn", "2 John"); put("2jo", "2 John"); put("2jean", "2 John")
        put("3jn", "3 John"); put("3jo", "3 John"); put("3jean", "3 John")
        put("jud", "Jude"); put("jude", "Jude")
        put("ap", "Revelation"); put("rev", "Revelation"); put("apocalypse", "Revelation"); put("apoc", "Revelation")
    }

    private fun normalize(s: String): String {
        val lower = s.lowercase()
            .replace("œ", "oe").replace("Œ", "OE")
        val decomposed = java.text.Normalizer.normalize(lower, java.text.Normalizer.Form.NFD)
        val noMarks = decomposed.replace(Regex("\\p{InCombiningDiacriticalMarks}+"), "")
        val sb = StringBuilder()
        for (c in noMarks) {
            if (c.isLetterOrDigit() || c == ' ') sb.append(c)
        }
        return sb.toString().trim().replace(Regex("\\s+"), " ")
    }

    /**
     * Tente de parser une reference biblique.
     * @return [BibleReference] si la chaine ressemble a une reference (livre + chapitre [+ verset]),
     *         null sinon (l'utilisateur a peut-etre fait une recherche full-text).
     */
    fun parse(input: String, books: List<BibleBook>): BibleReference? {
        if (input.isBlank()) return null
        val raw = input.trim()
        if (!Regex("""\d""").containsMatchIn(raw)) return null

        // Separateurs chapitre:verset = ":" ou " " ou "."
        // 1) Avec verset : "Jean 3:16" / "Jean 3 16" / "Jean 3:16-18"
        val withVerse = Regex(
            """^(\d\s)?([A-Za-z]+(?:\s[A-Za-z]+){0,4})\s+(\d+)[\s:.]+(\d+)(?:[-–](\d+))?$"""
        )
        // 2) Sans verset : "Psaumes 23"
        val noVerse = Regex(
            """^(\d\s)?([A-Za-z]+(?:\s[A-Za-z]+){0,4})\s+(\d+)$"""
        )

        var bookPart = ""
        var chap = 0
        var v1: Int? = null
        var v2: Int? = null

        val m = withVerse.matchEntire(raw)
        if (m != null) {
            val num = m.groupValues[1].trim()
            bookPart = (if (num.isNotEmpty()) "$num " else "") + m.groupValues[2].trim()
            chap = m.groupValues[3].toIntOrNull() ?: 0
            v1 = m.groupValues[4].toIntOrNull()
            v2 = m.groupValues[5].toIntOrNull().takeIf { it != null && it > 0 }
        } else {
            val m2 = noVerse.matchEntire(raw)
            if (m2 != null) {
                val num = m2.groupValues[1].trim()
                bookPart = (if (num.isNotEmpty()) "$num " else "") + m2.groupValues[2].trim()
                chap = m2.groupValues[3].toIntOrNull() ?: 0
            } else {
                return null
            }
        }
        if (chap <= 0 || bookPart.isEmpty()) return null

        val normalizedBook = normalize(bookPart)
        val canonical = aliases[normalizedBook]
        val bookIndex = if (canonical != null) {
            books.indexOfFirst { it.name.equals(canonical, ignoreCase = true) }
        } else {
            books.indexOfFirst { normalize(it.name).equals(normalizedBook, ignoreCase = true) }
        }
        if (bookIndex < 0) return null
        val book = books[bookIndex]
        if (chap > book.chapters.size) return null
        val chapterVerses = book.chapters[chap - 1]
        val maxVerse = chapterVerses.size

        if (v1 != null) {
            if (v1 < 1 || v1 > maxVerse) return null
            if (v2 != null) {
                if (v2 < v1 || v2 > maxVerse) return null
            }
        }

        return BibleReference(
            bookIndex = bookIndex,
            chapter = chap,
            verseStart = v1,
            verseEnd = v2,
            rawInput = raw
        )
    }

    fun looksLikeReference(input: String): Boolean {
        if (input.isBlank()) return false
        val raw = input.trim()
        if (!Regex("""\d""").containsMatchIn(raw)) return false
        return raw.contains(":") || raw.count { it == ' ' } >= 1
    }
}

data class BibleReference(
    val bookIndex: Int,
    val chapter: Int,
    val verseStart: Int?,
    val verseEnd: Int?,
    val rawInput: String
) {
    fun toDisplay(bookName: String): String {
        val base = "$bookName $chapter"
        return when {
            verseStart != null && verseEnd != null && verseEnd != verseStart -> "$base:$verseStart-$verseEnd"
            verseStart != null -> "$base:$verseStart"
            else -> base
        }
    }
}
