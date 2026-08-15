package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorite_verses")
data class FavoriteVerseEntity(
    @PrimaryKey val reference: String,
    val text: String
)
