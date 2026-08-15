package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "messages")
data class MessageDraftEntity(
    @PrimaryKey val id: String,
    val title: String,
    val body: String,
    val createdAt: String,
    val platform: String = "SMS"
)
