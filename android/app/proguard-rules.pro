# FAITH ProGuard rules

# Room: keep data layer classes
-keep class com.pastoral.tool.data.entity.** { *; }
-keep class com.pastoral.tool.data.dao.** { *; }
-keep class com.pastoral.tool.domain.** { *; }
-keep class com.pastoral.tool.data.* { *; }

# Room: keep RoomDatabase subclasses
-keep class * extends androidx.room.RoomDatabase
-keep class androidx.room.** { *; }

# Keep Room generated DAO implementations
-keep class *Dao { *; }
-keep class *Dao$* { *; }

# Kotlin serialization
-keep class kotlinx.serialization.** { *; }
-keep class com.pastoral.tool.domain.** { *; }

# Keep enum values
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Suppress logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
}
