package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "converts")
data class ConvertEntity(
    @PrimaryKey val id: String,
    val name: String,
    val date: String,
    val phone: String = "",
    val notes: String = ""
)
