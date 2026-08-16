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

@Serializable
data class Member(
    val id: String,
    val firstName: String,
    val lastName: String = "",
    val gender: String = "",
    val birthDate: String = "",
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val city: String = "",
    val photoUri: String? = null,
    val memberType: String = "Membre",
    val memberStatus: String = "Actif",
    val joinDate: String = "",
    val baptized: Boolean = false,
    val baptismDate: String = "",
    val familyRole: String = "",
    val spouseId: String? = null,
    val parentIds: List<String> = emptyList(),
    val sponsorId: String? = null,
    val cellGroupId: String? = null,
    val tags: List<String> = emptyList(),
    val notes: String = "",
    val lastVisitDate: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
) {
    val fullName: String get() = if (lastName.isBlank()) firstName else firstName + " " + lastName
    val initials: String get() = (firstName.firstOrNull()?.toString() ?: "") + (lastName.firstOrNull()?.toString() ?: "").uppercase()
    val age: Int? get() {
        if (birthDate.length < 4) return null
        val year = birthDate.substring(0, 4).toIntOrNull() ?: return null
        return java.util.Calendar.getInstance().get(java.util.Calendar.YEAR) - year
    }
}
