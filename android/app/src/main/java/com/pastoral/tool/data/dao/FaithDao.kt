package com.pastoral.tool.data.dao

import androidx.room.*
import com.pastoral.tool.data.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ProfileDao {
    @Query("SELECT * FROM profile WHERE id = 'default' LIMIT 1")
    fun get(): Flow<ProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun save(entity: ProfileEntity)
}

@Dao
interface VisitDao {
    @Query("SELECT * FROM visits ORDER BY date DESC")
    fun getAll(): Flow<List<VisitEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: VisitEntity)

    @Delete
    suspend fun delete(entity: VisitEntity)
}

@Dao
interface CultDao {
    @Query("SELECT * FROM cults ORDER BY dayOfWeek, time")
    fun getAll(): Flow<List<CultEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: CultEntity)

    @Delete
    suspend fun delete(entity: CultEntity)
}

@Dao
interface ContactDao {
    @Query("SELECT * FROM contacts ORDER BY name")
    fun getAll(): Flow<List<ContactEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: ContactEntity)

    @Delete
    suspend fun delete(entity: ContactEntity)
}

@Dao
interface ConvertDao {
    @Query("SELECT * FROM converts ORDER BY date DESC")
    fun getAll(): Flow<List<ConvertEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: ConvertEntity)

    @Delete
    suspend fun delete(entity: ConvertEntity)
}

@Dao
interface SermonDao {
    @Query("SELECT * FROM sermons ORDER BY date DESC")
    fun getAll(): Flow<List<SermonEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: SermonEntity)

    @Delete
    suspend fun delete(entity: SermonEntity)
}

@Dao
interface PrayerDao {
    @Query("SELECT * FROM prayers ORDER BY date DESC")
    fun getAll(): Flow<List<PrayerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: PrayerEntity)

    @Delete
    suspend fun delete(entity: PrayerEntity)
}

@Dao
interface MessageDao {
    @Query("SELECT * FROM messages ORDER BY createdAt DESC")
    fun getAll(): Flow<List<MessageDraftEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: MessageDraftEntity)

    @Delete
    suspend fun delete(entity: MessageDraftEntity)
}

@Dao
interface SettingsDao {
    @Query("SELECT * FROM settings WHERE id = 'default' LIMIT 1")
    fun get(): Flow<AppSettingsEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun save(entity: AppSettingsEntity)
}

@Dao
interface FavoriteVerseDao {
    @Query("SELECT * FROM favorite_verses")
    fun getAll(): Flow<List<FavoriteVerseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entity: FavoriteVerseEntity)

    @Query("DELETE FROM favorite_verses WHERE reference = :reference")
    suspend fun delete(reference: String)
}
