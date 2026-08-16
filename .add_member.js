const fs = require('fs');
const p = 'C:/Users/zereg/FAITH/android/app/src/main/java/com/pastoral/tool/domain/Models.kt';
let c = fs.readFileSync(p, 'utf8');
if (c.includes('data class Member')) {
  console.log('Member existe déjà');
  process.exit(0);
}
const addition = String.raw`
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
`;
c = c.trimEnd() + '\n' + addition;
fs.writeFileSync(p, c, 'utf8');
console.log('Member ajoute. Taille finale : ' + c.length + ' octets');