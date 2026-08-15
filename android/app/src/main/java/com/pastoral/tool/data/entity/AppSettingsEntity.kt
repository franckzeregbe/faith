package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "settings")
data class AppSettingsEntity(
    @PrimaryKey val id: String = "default",
    val pinHash: String? = null,
    val darkMode: Boolean = false,
    val notificationsEnabled: Boolean = true
)
