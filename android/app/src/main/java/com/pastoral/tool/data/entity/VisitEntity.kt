package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "visits")
data class VisitEntity(
    @PrimaryKey val id: String,
    val personName: String,
    val address: String = "",
    val date: String,
    val notes: String = "",
    val done: Boolean = false
)
