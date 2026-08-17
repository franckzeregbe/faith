package com.pastoral.tool

import android.app.Application
import androidx.room.Room
import com.pastoral.tool.data.AppDatabase
import com.pastoral.tool.data.FaithRepository
import com.pastoral.tool.data.LocalStorage
import com.pastoral.tool.notification.NotificationHelper

class FaithApp : Application() {
    val database by lazy {
        Room.databaseBuilder(
            applicationContext,
            AppDatabase::class.java,
            "faith.db"
        ).fallbackToDestructiveMigration().build()
    }
    val repository by lazy { FaithRepository(database) }
    val localStorage by lazy { LocalStorage(applicationContext) }

    override fun onCreate() {
        super.onCreate()
        NotificationHelper.createChannel(this)
    }
}
