const fs = require('fs');
const path = 'C:/Users/zereg/FAITH/android/app/src/main/java/com/pastoral/tool/data/dao/MemberDao.kt';
const content = String.raw`
package com.pastoral.tool.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.pastoral.tool.data.entity.MemberEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface MemberDao {
    @Query("SELECT * FROM members ORDER BY lastName ASC, firstName ASC")
    fun getAll(): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE memberType = :type ORDER BY lastName ASC, firstName ASC")
    fun getByType(type: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE memberStatus = :status ORDER BY lastName ASC, firstName ASC")
    fun getByStatus(status: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE id = :id LIMIT 1")
    fun getById(id: String): Flow<MemberEntity?>

    @Query("SELECT * FROM members WHERE firstName LIKE :q OR lastName LIKE :q OR phone LIKE :q OR city LIKE :q ORDER BY lastName ASC, firstName ASC")
    fun search(q: String): Flow<List<MemberEntity>>

    @Query("SELECT COUNT(*) FROM members")
    fun count(): Flow<Int>

    @Query("SELECT COUNT(*) FROM members WHERE memberType = :type")
    fun countByType(type: String): Flow<Int>

    @Query("SELECT * FROM members WHERE birthDate != '' AND substr('0000-' || substr(birthDate, 6, 10), 6, 5) BETWEEN :fromMMDD AND :toMMDD ORDER BY birthDate ASC")
    fun getBirthdaysBetween(fromMMDD: String, toMMDD: String): Flow<List<MemberEntity>>

    @Query("SELECT * FROM members WHERE memberType = 'Nouveau converti' ORDER BY joinDate DESC")
    fun getNewConverts(): Flow<List<MemberEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: MemberEntity)

    @Delete
    suspend fun delete(entity: MemberEntity)

    @Query("DELETE FROM members WHERE id = :id")
    suspend fun deleteById(id: String)
}
`;
fs.writeFileSync(path, content, 'utf8');
console.log('MemberDao cree (' + content.length + ' octets)');