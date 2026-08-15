package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "profile")
data class ProfileEntity(
    @PrimaryKey val id: String = "default",
    val name: String = "",
    val role: String = "",
    val church: String = "",
    val photoUri: String? = null,
    val slogan: String? = null
)
