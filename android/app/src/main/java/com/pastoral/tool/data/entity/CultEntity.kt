package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cults")
data class CultEntity(
    @PrimaryKey val id: String,
    val title: String,
    val dayOfWeek: Int,
    val time: String,
    val location: String = "",
    val notes: String = ""
)
