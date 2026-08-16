const fs = require('fs');
const path = 'C:/Users/zereg/FAITH/android/app/src/main/java/com/pastoral/tool/data/entity/MemberEntity.kt';
const content = String.raw`
package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "members")
data class MemberEntity(
    @PrimaryKey val id: String,
    val firstName: String,
    val lastName: String = "",
    val gender: String = "",
    val birthDate: String = "",
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val city: String = "",
    val photoUri: String? = null,
    val memberType: String = "Membre",
    val memberStatus: String = "Actif",
    val joinDate: String = "",
    val baptized: Boolean = false,
    val baptismDate: String = "",
    val familyRole: String = "",
    val spouseId: String? = null,
    val parentIds: String = "",     // CSV, restauré en List<String>
    val sponsorId: String? = null,
    val cellGroupId: String? = null,
    val tags: String = "",          // CSV
    val notes: String = "",
    val lastVisitDate: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
)
`;
fs.writeFileSync(path, content, 'utf8');
console.log('MemberEntity cree (' + content.length + ' octets)');