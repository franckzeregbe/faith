package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "prayers")
data class PrayerEntity(
    @PrimaryKey val id: String,
    val title: String,
    val request: String,
    val date: String,
    val answered: Boolean = false
)
