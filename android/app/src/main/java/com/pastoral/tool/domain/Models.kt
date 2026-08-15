package com.pastoral.tool.domain

import kotlinx.serialization.Serializable

@Serializable
data class Profile(
    val name: String = "",
    val role: String = "",
    val church: String = "",
    val photoUri: String? = null,
    val slogan: String? = null
)

@Serializable
data class Visit(
    val id: String,
    val personName: String,
    val address: String = "",
    val date: String,
    val notes: String = "",
    val done: Boolean = false
)

@Serializable
data class Cult(
    val id: String,
    val title: String,
    val dayOfWeek: Int,
    val time: String,
    val location: String = "",
    val notes: String = ""
)

@Serializable
data class Contact(
    val id: String,
    val name: String,
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val category: String = "",
    val notes: String = ""
)

@Serializable
data class Convert(
    val id: String,
    val name: String,
    val date: String,
    val phone: String = "",
    val notes: String = ""
)

@Serializable
data class Sermon(
    val id: String,
    val title: String,
    val date: String,
    val reference: String = "",
    val notes: String = "",
    val tags: List<String> = emptyList()
)

@Serializable
data class Prayer(
    val id: String,
    val title: String,
    val request: String,
    val date: String,
    val answered: Boolean = false
)

@Serializable
data class MessageDraft(
    val id: String,
    val title: String,
    val body: String,
    val createdAt: String,
    val platform: String = "SMS"
)

@Serializable
data class AppSettings(
    val pinHash: String? = null,
    val darkMode: Boolean = false,
    val notificationsEnabled: Boolean = true
)
