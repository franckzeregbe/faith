package com.pastoral.tool.data

import com.pastoral.tool.data.entity.*
import com.pastoral.tool.domain.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class FaithRepository(private val db: AppDatabase) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _profile = MutableStateFlow(Profile())
    val profile: StateFlow<Profile> = _profile.asStateFlow()
    fun saveProfile(p: Profile) {
        scope.launch { db.profileDao().save(p.toEntity()) }
        _profile.value = p
    }

    private val _visits = MutableStateFlow(emptyList<Visit>())
    val visits: StateFlow<List<Visit>> = _visits.asStateFlow()
    fun saveVisits(list: List<Visit>) {
        scope.launch {
            list.forEach { db.visitDao().insert(it.toEntity()) }
        }
        _visits.value = list
    }
    fun addVisit(v: Visit) {
        scope.launch { db.visitDao().insert(v.toEntity()) }
        _visits.value = _visits.value + v
    }
    fun removeVisit(id: String) {
        val v = _visits.value.find { it.id == id } ?: return
        scope.launch { db.visitDao().delete(v.toEntity()) }
        _visits.value = _visits.value.filter { it.id != id }
    }

    private val _contacts = MutableStateFlow(emptyList<Contact>())
    val contacts: StateFlow<List<Contact>> = _contacts.asStateFlow()
    fun saveContacts(list: List<Contact>) {
        scope.launch { list.forEach { db.contactDao().insert(it.toEntity()) } }
        _contacts.value = list
    }
    fun addContact(c: Contact) {
        scope.launch { db.contactDao().insert(c.toEntity()) }
        _contacts.value = _contacts.value + c
    }
    fun removeContact(id: String) {
        val c = _contacts.value.find { it.id == id } ?: return
        scope.launch { db.contactDao().delete(c.toEntity()) }
        _contacts.value = _contacts.value.filter { it.id != id }
    }

    private val _cults = MutableStateFlow(emptyList<Cult>())
    val cults: StateFlow<List<Cult>> = _cults.asStateFlow()
    fun saveCults(list: List<Cult>) {
        scope.launch { list.forEach { db.cultDao().insert(it.toEntity()) } }
        _cults.value = list
    }
    fun addCult(c: Cult) {
        scope.launch { db.cultDao().insert(c.toEntity()) }
        _cults.value = _cults.value + c
    }
    fun removeCult(id: String) {
        val c = _cults.value.find { it.id == id } ?: return
        scope.launch { db.cultDao().delete(c.toEntity()) }
        _cults.value = _cults.value.filter { it.id != id }
    }

    private val _converts = MutableStateFlow(emptyList<Convert>())
    val converts: StateFlow<List<Convert>> = _converts.asStateFlow()
    fun saveConverts(list: List<Convert>) {
        scope.launch { list.forEach { db.convertDao().insert(it.toEntity()) } }
        _converts.value = list
    }
    fun addConvert(c: Convert) {
        scope.launch { db.convertDao().insert(c.toEntity()) }
        _converts.value = _converts.value + c
    }
    fun removeConvert(id: String) {
        val c = _converts.value.find { it.id == id } ?: return
        scope.launch { db.convertDao().delete(c.toEntity()) }
        _converts.value = _converts.value.filter { it.id != id }
    }

    private val _sermons = MutableStateFlow(emptyList<Sermon>())
    val sermons: StateFlow<List<Sermon>> = _sermons.asStateFlow()
    fun saveSermons(list: List<Sermon>) {
        scope.launch { list.forEach { db.sermonDao().insert(it.toEntity()) } }
        _sermons.value = list
    }
    fun addSermon(s: Sermon) {
        scope.launch { db.sermonDao().insert(s.toEntity()) }
        _sermons.value = _sermons.value + s
    }
    fun removeSermon(id: String) {
        val s = _sermons.value.find { it.id == id } ?: return
        scope.launch { db.sermonDao().delete(s.toEntity()) }
        _sermons.value = _sermons.value.filter { it.id != id }
    }

    private val _prayers = MutableStateFlow(emptyList<Prayer>())
    val prayers: StateFlow<List<Prayer>> = _prayers.asStateFlow()
    fun savePrayers(list: List<Prayer>) {
        scope.launch { list.forEach { db.prayerDao().insert(it.toEntity()) } }
        _prayers.value = list
    }
    fun addPrayer(p: Prayer) {
        scope.launch { db.prayerDao().insert(p.toEntity()) }
        _prayers.value = _prayers.value + p
    }
    fun removePrayer(id: String) {
        val p = _prayers.value.find { it.id == id } ?: return
        scope.launch { db.prayerDao().delete(p.toEntity()) }
        _prayers.value = _prayers.value.filter { it.id != id }
    }

    private val _messages = MutableStateFlow(emptyList<MessageDraft>())
    val messages: StateFlow<List<MessageDraft>> = _messages.asStateFlow()
    fun saveMessages(list: List<MessageDraft>) {
        scope.launch { list.forEach { db.messageDao().insert(it.toEntity()) } }
        _messages.value = list
    }
    fun addMessage(m: MessageDraft) {
        scope.launch { db.messageDao().insert(m.toEntity()) }
        _messages.value = _messages.value + m
    }
    fun removeMessage(id: String) {
        val m = _messages.value.find { it.id == id } ?: return
        scope.launch { db.messageDao().delete(m.toEntity()) }
        _messages.value = _messages.value.filter { it.id != id }
    }

    private val _settings = MutableStateFlow(AppSettings())
    val settings: StateFlow<AppSettings> = _settings.asStateFlow()
    fun saveSettings(s: AppSettings) {
        scope.launch { db.settingsDao().save(s.toEntity()) }
        _settings.value = s
    }

    private val _favoriteVerses = MutableStateFlow(emptyList<Pair<String, String>>())
    val favoriteVerses: StateFlow<List<Pair<String, String>>> = _favoriteVerses.asStateFlow()
    fun addFavoriteVerse(reference: String, text: String) {
        scope.launch { db.favoriteVerseDao().insert(FavoriteVerseEntity(reference, text)) }
        _favoriteVerses.value = _favoriteVerses.value + (reference to text)
    }
    fun removeFavoriteVerse(reference: String) {
        scope.launch { db.favoriteVerseDao().delete(reference) }
        _favoriteVerses.value = _favoriteVerses.value.filter { it.first != reference }
    }

    init {
        scope.launch {
            db.profileDao().get().filterNotNull().collect { _profile.value = it.toDomain() }
        }
        scope.launch {
            db.visitDao().getAll().collect { _visits.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.contactDao().getAll().collect { _contacts.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.cultDao().getAll().collect { _cults.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.convertDao().getAll().collect { _converts.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.sermonDao().getAll().collect { _sermons.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.prayerDao().getAll().collect { _prayers.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.messageDao().getAll().collect { _messages.value = it.map { e -> e.toDomain() } }
        }
        scope.launch {
            db.settingsDao().get().filterNotNull().collect { _settings.value = it.toDomain() }
        }
        scope.launch {
            db.favoriteVerseDao().getAll().collect { list ->
                _favoriteVerses.value = list.map { it.reference to it.text }
            }
        }
    }
}

private fun Profile.toEntity() = ProfileEntity(name = name, role = role, church = church, photoUri = photoUri, slogan = slogan)
private fun ProfileEntity.toDomain() = Profile(name = name, role = role, church = church, photoUri = photoUri, slogan = slogan)

private fun Visit.toEntity() = VisitEntity(id = id, personName = personName, address = address, date = date, notes = notes, done = done)
private fun VisitEntity.toDomain() = Visit(id = id, personName = personName, address = address, date = date, notes = notes, done = done)

private fun Cult.toEntity() = CultEntity(id = id, title = title, dayOfWeek = dayOfWeek, time = time, location = location, notes = notes)
private fun CultEntity.toDomain() = Cult(id = id, title = title, dayOfWeek = dayOfWeek, time = time, location = location, notes = notes)

private fun Contact.toEntity() = ContactEntity(id = id, name = name, phone = phone, email = email, address = address, category = category, notes = notes)
private fun ContactEntity.toDomain() = Contact(id = id, name = name, phone = phone, email = email, address = address, category = category, notes = notes)

private fun Convert.toEntity() = ConvertEntity(id = id, name = name, date = date, phone = phone, notes = notes)
private fun ConvertEntity.toDomain() = Convert(id = id, name = name, date = date, phone = phone, notes = notes)

private fun Sermon.toEntity() = SermonEntity(id = id, title = title, date = date, reference = reference, notes = notes, tags = tags.joinToString(","))
private fun SermonEntity.toDomain() = Sermon(id = id, title = title, date = date, reference = reference, notes = notes, tags = if (tags.isBlank()) emptyList() else tags.split(","))

private fun Prayer.toEntity() = PrayerEntity(id = id, title = title, request = request, date = date, answered = answered)
private fun PrayerEntity.toDomain() = Prayer(id = id, title = title, request = request, date = date, answered = answered)

private fun MessageDraft.toEntity() = MessageDraftEntity(id = id, title = title, body = body, createdAt = createdAt, platform = platform)
private fun MessageDraftEntity.toDomain() = MessageDraft(id = id, title = title, body = body, createdAt = createdAt, platform = platform)

private fun AppSettings.toEntity() = AppSettingsEntity(pinHash = pinHash, darkMode = darkMode, notificationsEnabled = notificationsEnabled)
private fun AppSettingsEntity.toDomain() = AppSettings(pinHash = pinHash, darkMode = darkMode, notificationsEnabled = notificationsEnabled)
