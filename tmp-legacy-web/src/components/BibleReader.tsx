import React, { useState, useEffect, useMemo, useRef } from 'react'
import { BIBLE } from '../data/bible-data'
import { loadJsonFromStorage, saveJsonToStorage } from '../utils/storage'

interface Bookmark {
  bookId: string
  chapter: number
  verse: number
  text: string
  date: string
}

const OT_BOOKS = [
  'gen', 'exo', 'lev', 'num', 'deu',
  'jos', 'jug', 'rut', '1sa', '2sa',
  '1ro', '2ro', '1ch', '2ch',
  'esd', 'neh', 'est', 'job',
  'psa', 'pro', 'ecc', 'can',
  'esi', 'jer', 'lam', 'eze', 'dan',
  'ose', 'joe', 'amo', 'abd', 'jon',
  'mic', 'nah', 'hab', 'soph', 'agg', 'zac', 'mal',
]

const NT_BOOKS = [
  'mat', 'mar', 'luc', 'joh', 'act',
  'rom', '1co', '2co', 'gal', 'eph', 'phi', 'col', '1th', '2th',
  '1ti', '2ti', 'tit', 'phm',
  'heb', 'jam', '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev',
]

const BOOK_ORDER = [...OT_BOOKS, ...NT_BOOKS]

function getTestament(bookId: string): 'AT' | 'NT' | null {
  if (OT_BOOKS.includes(bookId)) return 'AT'
  if (NT_BOOKS.includes(bookId)) return 'NT'
  return null
}

interface SearchResult {
  bookId: string
  bookName: string
  chapter: number
  verse: number
  text: string
}

function searchBible(query: string): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: SearchResult[] = []
  for (const [bookId, book] of Object.entries(BIBLE)) {
    for (let ci = 0; ci < book.chapters.length; ci++) {
      const chapter = book.chapters[ci]
      for (let vi = 0; vi < chapter.length; vi++) {
        if (chapter[vi].toLowerCase().includes(q)) {
          results.push({ bookId, bookName: book.name, chapter: ci + 1, verse: vi + 1, text: chapter[vi] })
          if (results.length >= 50) return results
        }
      }
    }
  }
  return results
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part,
  )
}

export default function BibleReader() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'books' | 'chapters' | 'reading' | 'search'>('books')
  const [darkMode, setDarkMode] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    loadJsonFromStorage<Bookmark[]>('faith_bible_bookmarks', []),
  )
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [fontSize, setFontSize] = useState<number>(() =>
    loadJsonFromStorage<number>('faith_bible_fontsize', 1.1),
  )
  const [copied, setCopied] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const readingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    saveJsonToStorage('faith_bible_bookmarks', bookmarks)
  }, [bookmarks])

  useEffect(() => {
    saveJsonToStorage('faith_bible_fontsize', fontSize)
  }, [fontSize])

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery])

  useEffect(() => {
    if (debouncedQuery) {
      setView('search')
    } else if (view === 'search') {
      setView(selectedChapter ? 'reading' : selectedBook ? 'chapters' : 'books')
    }
  }, [debouncedQuery])

  const searchResults = useMemo(() => searchBible(debouncedQuery), [debouncedQuery])

  const bookList = useMemo(
    () =>
      Object.entries(BIBLE)
        .sort(([a], [b]) => {
          const ai = BOOK_ORDER.indexOf(a)
          const bi = BOOK_ORDER.indexOf(b)
          return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
        })
        .map(([id, book]) => ({ id, name: book.name, chapters: book.chapters })),
    [],
  )

  const currentBook = selectedBook ? BIBLE[selectedBook] ?? null : null
  const currentChapterVerses =
    selectedBook && selectedChapter !== null ? BIBLE[selectedBook]?.chapters[selectedChapter - 1] ?? null : null
  const chapterCount = currentBook?.chapters.length ?? 0

  // Verset du jour : déterministe selon la date
  const verseOfDay = useMemo(() => {
    const now = new Date()
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    const bookEntries = Object.entries(BIBLE).sort(([a], [b]) => {
      const ai = BOOK_ORDER.indexOf(a)
      const bi = BOOK_ORDER.indexOf(b)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
    const bookId = bookEntries[seed % bookEntries.length][0]
    const book = BIBLE[bookId]
    const chapterIndex = seed % book.chapters.length
    const chapter = book.chapters[chapterIndex]
    const verseIndex = seed % chapter.length
    return {
      bookId,
      bookName: book.name,
      chapter: chapterIndex + 1,
      verse: verseIndex + 1,
      text: chapter[verseIndex],
    }
  }, [])

  const bookmarksByRef = useMemo(() => {
    const map = new Map<string, Bookmark>()
    for (const b of bookmarks) map.set(`${b.bookId}:${b.chapter}:${b.verse}`, b)
    return map
  }, [bookmarks])

  function toggleBookmark(verse: number) {
    if (!selectedBook || selectedChapter === null || !currentChapterVerses) return
    const key = `${selectedBook}:${selectedChapter}:${verse}`
    if (bookmarksByRef.has(key)) {
      setBookmarks(prev => prev.filter(b => `${b.bookId}:${b.chapter}:${b.verse}` !== key))
    } else {
      setBookmarks(prev => [
        ...prev,
        { bookId: selectedBook, chapter: selectedChapter, verse, text: currentChapterVerses[verse - 1], date: new Date().toISOString() },
      ])
    }
  }

  function handleBookmarkClick(b: Bookmark) {
    setSelectedBook(b.bookId)
    setSelectedChapter(b.chapter)
    setShowBookmarks(false)
    setView('reading')
  }

  async function copyChapter() {
    if (!currentChapterVerses) return
    const text = currentChapterVerses.map((v, i) => `${i + 1} ${v}`).join('\n')
    try {
      await navigator.clipboard.writeText(`${currentBook?.name} ${selectedChapter}\n\n${text}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard indisponible */
    }
  }

  function goToAdjacentBook(delta: number) {
    if (!selectedBook || !selectedChapter) return
    const idx = BOOK_ORDER.indexOf(selectedBook)
    const next = BOOK_ORDER[idx + delta]
    if (!next) return
    setSelectedBook(next)
    setSelectedChapter(1)
    setView('reading')
    setTimeout(() => readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  function handleSelectBook(bookId: string) {
    setSelectedBook(bookId)
    setSelectedChapter(null)
    setView('chapters')
  }

  function handleSelectChapter(chapter: number) {
    setSelectedChapter(chapter)
    setView('reading')
  }

  function handleSearchSelect(bookId: string, chapter: number) {
    setSelectedBook(bookId)
    setSelectedChapter(chapter)
    setSearchQuery('')
    setDebouncedQuery('')
    setView('reading')
  }

  function handleBack() {
    if (view === 'chapters') {
      setSelectedBook(null)
      setView('books')
    } else if (view === 'reading') {
      setSelectedChapter(null)
      setView('chapters')
    }
  }

  function changeChapter(delta: number) {
    if (!selectedBook || selectedChapter === null) return
    const next = selectedChapter + delta
    if (next >= 1 && next <= chapterCount) {
      setSelectedChapter(next)
      readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function setQuickJumpChapter(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = Number(e.target.value)
    if (val) goToChapter(val)
  }

  function setQuickJumpBook(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val) handleSelectBook(val)
  }

  function goToChapter(chapter: number) {
    setSelectedChapter(chapter)
    if (view !== 'reading') setView('reading')
    setTimeout(() => readingRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const visibleView = debouncedQuery ? 'search' : view

  return (
    <>
      <div className={`bible-container ${darkMode ? 'bible-dark' : ''}`}>
        <div className="bible-header">
          {selectedBook && (
            <div className="bible-quick-jump">
              <select className="bible-qj-select" value={selectedBook} onChange={setQuickJumpBook}>
                {bookList.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select className="bible-qj-select" value={selectedChapter ?? ''} onChange={setQuickJumpChapter}>
                <option value="">Ch.</option>
                {Array.from({ length: chapterCount }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Chapitre {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="bible-header-actions">
            <div className="bible-search-bar">
              <svg className="bible-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="bible-search-input"
                type="text"
                placeholder="Rechercher dans la Bible..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="bible-search-clear" onClick={() => setSearchQuery('')}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              className={`bible-dark-toggle ${darkMode ? 'active' : ''}`}
              onClick={() => setDarkMode(d => !d)}
              title="Mode nuit"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="bible-panels">
          {visibleView === 'books' && !debouncedQuery && (
            <div className="bible-vod">
              <div className="bible-vod-badge">✨ Verset du jour</div>
              <p className="bible-vod-text">{verseOfDay.text}</p>
              <button
                className="bible-vod-ref"
                onClick={() => handleSearchSelect(verseOfDay.bookId, verseOfDay.chapter)}
              >
                {verseOfDay.bookName} {verseOfDay.chapter}:{verseOfDay.verse}
              </button>
            </div>
          )}

          {showBookmarks && (
            <div className="bible-bookmarks-panel">
              <div className="bible-panel-header">
                <button
                  className="bible-back-btn"
                  onClick={() => setShowBookmarks(false)}
                  aria-label="Fermer les signets"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
                <h2>Signets</h2>
                <span className="bible-bookmarks-count">{bookmarks.length}</span>
              </div>
              <div className="bible-panel-scroll">
                {bookmarks.length === 0 ? (
                  <div className="bible-empty">Aucun signet. Touche l'étoile sur un verset pour le garder.</div>
                ) : (
                  <div className="bible-bookmarks-list">
                    {bookmarks.map((b, i) => (
                      <button key={i} className="bible-bookmark-item" onClick={() => handleBookmarkClick(b)}>
                        <span className="bible-bookmark-ref">
                          {BIBLE[b.bookId]?.name ?? b.bookId} {b.chapter}:{b.verse}
                        </span>
                        <span className="bible-bookmark-text">{b.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className={`bible-panel bible-panel-books ${view === 'books' ? 'visible' : ''} ${selectedBook ? 'has-selection' : ''}`}
          >
            <div className="bible-panel-header">
              <h2>Livres</h2>
            </div>
            <div className="bible-panel-scroll">
              {bookList.length === 0 ? (
                <div className="bible-empty">Aucun livre disponible</div>
              ) : (
                ['AT', 'NT'].map(testament => {
                  const label = testament === 'AT' ? 'Ancien Testament' : 'Nouveau Testament'
                  const books = bookList.filter(b => getTestament(b.id) === testament)
                  if (books.length === 0) return null
                  return (
                    <div key={testament} className="bible-section">
                      <div className="bible-section-label">{label}</div>
                      <div className="bible-section-books">
                        {books.map(book => (
                          <button
                            key={book.id}
                            className={`bible-book-card ${selectedBook === book.id ? 'active' : ''}`}
                            onClick={() => handleSelectBook(book.id)}
                          >
                            <span className="bible-book-name">{book.name}</span>
                            <span className="bible-book-meta">{book.chapters.length} ch.</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div
            className={`bible-panel bible-panel-chapters ${view === 'chapters' || (view === 'reading' && !selectedChapter) ? 'visible' : ''}`}
          >
            <div className="bible-panel-header">
              {selectedBook && (
                <button className="bible-back-btn" onClick={handleBack} aria-label="Retour aux livres">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              )}
              <h2>{currentBook?.name ?? 'Chapitres'}</h2>
            </div>
            <div className="bible-panel-scroll">
              {currentBook ? (
                <div className="bible-chapter-grid">
                  {Array.from({ length: chapterCount }, (_, i) => (
                    <button
                      key={i}
                      className={`bible-chapter-item ${selectedChapter === i + 1 ? 'active' : ''}`}
                      onClick={() => handleSelectChapter(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bible-empty">Sélectionne un livre</div>
              )}
            </div>
          </div>

          <div
            className={`bible-panel bible-panel-reading ${visibleView === 'reading' || (visibleView === 'search' && currentChapterVerses) ? 'visible' : ''}`}
          >
            <div className="bible-panel-header">
              {selectedChapter && (
                <button className="bible-back-btn" onClick={handleBack} aria-label="Retour aux chapitres">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              )}
              <h2>
                {currentBook?.name} {selectedChapter}
              </h2>
              {selectedChapter && chapterCount > 1 && (
                <div className="bible-chapter-nav">
                  <button className="bible-ch-nav-btn" disabled={selectedChapter <= 1} onClick={() => changeChapter(-1)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <span className="bible-ch-nav-label">{selectedChapter} / {chapterCount}</span>
                  <button className="bible-ch-nav-btn" disabled={selectedChapter >= chapterCount} onClick={() => changeChapter(1)}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              )}
              {selectedChapter && (
                <div className="bible-reading-tools">
                  <button
                    className={`bible-tool-btn ${bookmarks.length > 0 ? 'has-items' : ''}`}
                    onClick={() => setShowBookmarks(s => !s)}
                    title="Signets"
                  >
                    🔖
                    {bookmarks.length > 0 && <span className="bible-tool-badge">{bookmarks.length}</span>}
                  </button>
                  <button
                    className="bible-tool-btn"
                    onClick={() => setFontSize(f => Math.max(0.85, +(f - 0.1).toFixed(2)))}
                    title="Réduire la police"
                    disabled={fontSize <= 0.85}
                  >
                    A−
                  </button>
                  <button
                    className="bible-tool-btn"
                    onClick={() => setFontSize(f => Math.min(1.6, +(f + 0.1).toFixed(2)))}
                    title="Agrandir la police"
                    disabled={fontSize >= 1.6}
                  >
                    A+
                  </button>
                  <button className="bible-tool-btn" onClick={copyChapter} title="Copier le chapitre">
                    {copied ? '✓' : '⧉'}
                  </button>
                </div>
              )}
            </div>
            <div className="bible-panel-scroll bible-reading-text" ref={readingRef} style={{ fontSize: `${fontSize}rem` }}>
              {currentChapterVerses ? (
                <>
                  {currentChapterVerses.map((verse, i) => (
                    <p key={i} className="bible-verse">
                      <sup className="bible-verse-num">{i + 1}</sup>
                      {verse}
                      <button
                        className={`bible-verse-mark ${bookmarksByRef.has(`${selectedBook}:${selectedChapter}:${i + 1}`) ? 'marked' : ''}`}
                        onClick={() => toggleBookmark(i + 1)}
                        title={bookmarksByRef.has(`${selectedBook}:${selectedChapter}:${i + 1}`) ? 'Retirer le signet' : 'Ajouter un signet'}
                      >
                        ★
                      </button>
                    </p>
                  ))}
                  <div className="bible-reading-footer">
                    <button className="bible-adj-btn" disabled={BOOK_ORDER.indexOf(selectedBook!) <= 0} onClick={() => goToAdjacentBook(-1)}>
                      ← {BOOK_ORDER.indexOf(selectedBook!) > 0 ? BIBLE[BOOK_ORDER[BOOK_ORDER.indexOf(selectedBook!) - 1]]?.name : ''}
                    </button>
                    <button
                      className="bible-adj-btn"
                      disabled={BOOK_ORDER.indexOf(selectedBook!) >= BOOK_ORDER.length - 1}
                      onClick={() => goToAdjacentBook(1)}
                    >
                      {BOOK_ORDER.indexOf(selectedBook!) < BOOK_ORDER.length - 1 ? BIBLE[BOOK_ORDER[BOOK_ORDER.indexOf(selectedBook!) + 1]]?.name : ''} →
                    </button>
                  </div>
                </>
              ) : (
                <div className="bible-empty bible-empty-reading">
                  <span className="bible-empty-icon">📖</span>
                  <p>Sélectionne un chapitre pour lire</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {visibleView === 'search' && searchResults.length > 0 && (
          <div className="bible-search-results-overlay">
            <div className="bible-search-results-header">
              <h3>Résultats pour « {debouncedQuery} »</h3>
              <span className="bible-search-count">{searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}</span>
            </div>
            <div className="bible-search-results">
              {searchResults.map((r, i) => (
                <button key={i} className="bible-search-result-item" onClick={() => handleSearchSelect(r.bookId, r.chapter)}>
                  <span className="bible-search-result-ref">{r.bookName} {r.chapter}:{r.verse}</span>
                  <span className="bible-search-result-text">{highlightText(r.text, debouncedQuery)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleView === 'search' && searchResults.length === 0 && debouncedQuery && (
          <div className="bible-search-results-overlay bible-search-empty-state">
            <span className="bible-empty-icon">🔍</span>
            <h3>Aucun résultat</h3>
            <p>Essaie un autre terme de recherche.</p>
          </div>
        )}
      </div>

      <style>{`
.bible-container {
  --bible-font: 'Georgia', 'Times New Roman', 'Palatino Linotype', serif;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
  background: var(--bg);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  max-width: 100%;
}

.bible-container.bible-dark {
  --bg: #1a1a1e;
  --bg-alt: #222226;
  --surface: #2a2a2e;
  --surface-alt: #323236;
  --text: #e8e4de;
  --text-secondary: #b0aca6;
  --muted: #88847e;
  --border: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.05);
  --primary-glow: rgba(187,143,93,0.15);
  --primary-soft: #3f352c;
  --shadow-sm: 0 4px 12px rgba(0,0,0,0.2);
  --shadow-md: 0 12px 28px rgba(0,0,0,0.3);
  --surface-card: rgba(255,255,255,0.04);
}

/* ===== HEADER ===== */
.bible-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 10;
}

.bible-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-shrink: 0;
}

.bible-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 240px;
}

.bible-search-bar:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.bible-search-icon {
  color: var(--muted);
  flex-shrink: 0;
}

.bible-search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 9px 0;
  font-size: 0.85rem;
  color: var(--text);
  font-family: var(--font);
  outline: none;
  min-width: 0;
}

.bible-search-input::placeholder {
  color: var(--muted);
}

.bible-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  background: var(--border);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  padding: 0;
}

.bible-search-clear:hover {
  background: var(--muted);
  color: var(--text);
}

.bible-dark-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  padding: 0;
}

.bible-dark-toggle:hover {
  background: var(--surface);
  border-color: var(--primary);
  transform: scale(1.05);
}

.bible-dark-toggle.active {
  background: var(--primary-soft);
  border-color: var(--primary);
}

/* ===== QUICK JUMP ===== */
.bible-quick-jump {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.bible-qj-select {
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  color: var(--text);
  font-size: 0.85rem;
  font-family: var(--font);
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  max-width: 160px;
}

.bible-qj-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

/* ===== PANELS ===== */
.bible-panels {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.bible-panel {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border-light);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
}

.bible-panel:last-child {
  border-right: none;
}

.bible-panel-books {
  width: 260px;
  min-width: 0;
}

.bible-panel-chapters {
  width: 200px;
  min-width: 0;
}

.bible-panel-reading {
  flex: 1 1 0;
  border-right: none;
  min-width: 0;
  overflow: hidden;
}

.bible-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
}

.bible-panel-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bible-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: var(--surface-alt);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}

.bible-back-btn:hover {
  background: var(--primary-soft);
  color: var(--text);
  transform: translateX(-2px);
}

.bible-panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.bible-panel-scroll::-webkit-scrollbar {
  width: 5px;
}

.bible-panel-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.bible-panel-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 10px;
}

.bible-panel-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--muted);
}

/* ===== BOOK LIST ===== */
.bible-section {
  margin-bottom: 16px;
}

.bible-section-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  padding: 0 4px 8px;
}

.bible-section-books {
  display: grid;
  gap: 4px;
}

.bible-book-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.bible-book-card:hover {
  background: var(--surface-alt);
  border-color: var(--border-light);
  transform: translateX(3px);
}

.bible-book-card:active {
  transform: translateX(1px) scale(0.98);
}

.bible-book-card.active {
  background: linear-gradient(135deg, var(--primary-soft), rgba(187, 143, 93, 0.08));
  border-color: var(--border);
  font-weight: 700;
}

.bible-book-name {
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.3;
}

.bible-book-meta {
  font-size: 0.72rem;
  color: var(--muted);
  white-space: nowrap;
  font-weight: 500;
  flex-shrink: 0;
}

.bible-book-card.active .bible-book-meta {
  color: var(--primary-dark);
}

/* ===== CHAPTER GRID ===== */
.bible-chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 6px;
}

.bible-chapter-item {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.bible-chapter-item:hover {
  background: var(--primary-soft);
  border-color: var(--primary-light);
  transform: scale(1.08);
  z-index: 1;
}

.bible-chapter-item:active {
  transform: scale(0.95);
}

.bible-chapter-item.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #362916;
  border-color: var(--primary);
  box-shadow: 0 4px 12px var(--primary-glow);
  font-weight: 800;
}

/* ===== CHAPTER NAV ===== */
.bible-chapter-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

.bible-ch-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-alt);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.bible-ch-nav-btn:hover:not(:disabled) {
  background: var(--primary-soft);
  color: var(--text);
  border-color: var(--primary);
}

.bible-ch-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.bible-ch-nav-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 48px;
  text-align: center;
}

/* ===== READING VIEW ===== */
.bible-reading-text {
  padding: 24px 28px;
  font-family: var(--bible-font);
  font-size: 1.1rem;
  line-height: 1.9;
  color: var(--text);
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.bible-verse {
  margin: 0 0 6px;
  text-align: justify;
}

.bible-verse-num {
  font-size: 0.65em;
  font-weight: 700;
  color: var(--primary);
  margin-right: 4px;
  font-family: var(--font);
  user-select: none;
  position: relative;
  top: -1px;
}

/* ===== SEARCH RESULTS ===== */
.bible-search-results-overlay {
  position: absolute;
  inset: 0;
  top: 60px;
  background: var(--surface);
  z-index: 20;
  overflow-y: auto;
  padding: 20px 24px;
  animation: bibleFadeIn 0.25s ease;
  max-width: 100%;
}

.bible-search-results-overlay .bible-search-result-item {
  max-width: 100%;
  overflow: hidden;
}

.bible-search-results-overlay .bible-empty-icon {
  font-size: 2.5rem;
  opacity: 0.3;
}

@keyframes bibleFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.bible-search-results-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.bible-search-results-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.bible-search-count {
  font-size: 0.82rem;
  color: var(--muted);
}

.bible-search-results {
  display: grid;
  gap: 6px;
}

.bible-search-result-item {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.bible-search-result-item:hover {
  background: var(--surface-alt);
  border-color: var(--border-light);
  transform: translateX(4px);
}

.bible-search-result-ref {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
}

.bible-search-result-text {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.bible-search-result-text mark {
  background: var(--primary-light);
  color: var(--text);
  border-radius: 2px;
  padding: 0 2px;
}

.bible-search-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.bible-search-empty-state h3 {
  margin: 0;
  color: var(--text);
}

.bible-search-empty-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ===== EMPTY STATES ===== */
.bible-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--muted);
  font-size: 0.88rem;
  text-align: center;
}

.bible-empty-reading {
  flex-direction: column;
  gap: 12px;
}

.bible-empty-icon {
  font-size: 2.5rem;
  opacity: 0.3;
}

/* ===== VERSET DU JOUR ===== */
.bible-vod {
  background: linear-gradient(135deg, var(--primary-soft), var(--surface));
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 18px 22px;
  margin: 16px 16px 0;
  display: grid;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.bible-vod::after {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--primary-glow), transparent 70%);
  pointer-events: none;
}

.bible-vod-badge {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--primary-dark);
}

.bible-vod-text {
  margin: 0;
  font-family: var(--bible-font);
  font-size: 1.05rem;
  font-style: italic;
  line-height: 1.7;
  color: var(--text);
}

.bible-vod-ref {
  justify-self: start;
  border: none;
  background: transparent;
  padding: 0;
  font-family: var(--font);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
  transition: color 0.2s, transform 0.2s;
}

.bible-vod-ref:hover {
  color: var(--primary-dark);
  transform: translateX(3px);
}

/* ===== SIGNETS ===== */
.bible-bookmarks-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
  max-width: 90%;
  background: var(--surface);
  border-right: 1px solid var(--border-light);
  z-index: 25;
  display: flex;
  flex-direction: column;
  animation: bibleSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes bibleSlideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.bible-bookmarks-count {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary-dark);
  background: var(--primary-soft);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.bible-bookmarks-list {
  display: grid;
  gap: 6px;
}

.bible-bookmark-item {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text);
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.bible-bookmark-item:hover {
  background: var(--surface-alt);
  border-color: var(--border-light);
  transform: translateX(3px);
}

.bible-bookmark-ref {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--primary);
}

.bible-bookmark-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== OUTILS DE LECTURE ===== */
.bible-reading-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

.bible-tool-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.bible-tool-btn:hover:not(:disabled) {
  background: var(--primary-soft);
  color: var(--text);
  border-color: var(--primary);
  transform: scale(1.05);
}

.bible-tool-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.bible-tool-btn.has-items {
  border-color: var(--primary);
}

.bible-tool-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-full);
  background: var(--primary);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== MARQUEUR DE VERSET ===== */
.bible-verse {
  position: relative;
  padding-right: 26px;
}

.bible-verse-mark {
  position: absolute;
  top: 2px;
  right: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: var(--border);
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  padding: 0;
}

.bible-verse:hover .bible-verse-mark {
  opacity: 1;
}

.bible-verse-mark:hover {
  transform: scale(1.2);
  color: var(--primary);
}

.bible-verse-mark.marked {
  opacity: 1;
  color: var(--primary);
  text-shadow: 0 2px 8px var(--primary-glow);
}

/* ===== FIN DE CHAPITRE ===== */
.bible-reading-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.bible-adj-btn {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: var(--font);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bible-adj-btn:hover:not(:disabled) {
  background: var(--primary-soft);
  color: var(--text);
  border-color: var(--primary);
}

.bible-adj-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .bible-container {
    border-radius: 0;
    min-height: auto;
  }

  .bible-header {
    flex-wrap: wrap;
    padding: 10px 12px;
    gap: 8px;
  }

  .bible-header-actions {
    width: 100%;
  }

  .bible-search-bar {
    flex: 1;
    width: auto;
  }

  .bible-quick-jump {
    width: 100%;
    order: -1;
  }

  .bible-qj-select {
    flex: 1;
    max-width: none;
  }

  .bible-panels {
    flex-direction: column;
    overflow-y: auto;
  }

  .bible-panel {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    display: none;
  }

  .bible-panel.visible {
    display: flex;
  }

  .bible-panel-scroll {
    max-height: 400px;
    overflow-y: auto;
  }

  .bible-reading-text {
    padding: 16px 18px;
    font-size: 1rem;
    line-height: 1.8;
  }

  .bible-search-results-overlay {
    position: relative;
    top: 0;
    padding: 16px;
  }

  .bible-panel-reading .bible-panel-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .bible-reading-tools {
    width: 100%;
    justify-content: flex-end;
    order: 2;
  }

  .bible-vod {
    margin: 12px;
  }

  .bible-bookmarks-panel {
    width: 100%;
    max-width: 100%;
  }

  .bible-chapter-grid {
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 5px;
  }

  .bible-section-books {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) {
  .bible-panel-books.has-selection {
    width: 220px;
  }

  .bible-back-btn {
    display: none;
  }

  .bible-panel-books .bible-back-btn,
  .bible-panel-chapters .bible-back-btn {
    display: none;
  }
}
`}</style>
    </>
  )
}
