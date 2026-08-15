package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sermons")
data class SermonEntity(
    @PrimaryKey val id: String,
    val title: String,
    val date: String,
    val reference: String = "",
    val notes: String = "",
    val tags: String = ""
)
