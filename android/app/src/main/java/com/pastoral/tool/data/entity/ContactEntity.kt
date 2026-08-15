package com.pastoral.tool.data.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "contacts")
data class ContactEntity(
    @PrimaryKey val id: String,
    val name: String,
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val category: String = "",
    val notes: String = ""
)
