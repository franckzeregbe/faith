package com.pastoral.tool.data

import androidx.room.Database
import androidx.room.RoomDatabase
import com.pastoral.tool.data.dao.*
import com.pastoral.tool.data.entity.*

@Database(
    entities = [
        ProfileEntity::class,
        VisitEntity::class,
        CultEntity::class,
        ContactEntity::class,
        ConvertEntity::class,
        SermonEntity::class,
        PrayerEntity::class,
        MessageDraftEntity::class,
        AppSettingsEntity::class,
        FavoriteVerseEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun profileDao(): ProfileDao
    abstract fun visitDao(): VisitDao
    abstract fun cultDao(): CultDao
    abstract fun contactDao(): ContactDao
    abstract fun convertDao(): ConvertDao
    abstract fun sermonDao(): SermonDao
    abstract fun prayerDao(): PrayerDao
    abstract fun messageDao(): MessageDao
    abstract fun settingsDao(): SettingsDao
    abstract fun favoriteVerseDao(): FavoriteVerseDao
}
