package com.pastoral.tool.notification

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

class CultReminderWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val title = inputData.getString("title") ?: "Culte à venir"
        val message = inputData.getString("message") ?: "N'oubliez pas votre engagement pastoral !"
        NotificationHelper.show(applicationContext, title, message)
        return Result.success()
    }

    companion object {
        fun schedule(context: Context, tag: String, title: String, message: String, delayMinutes: Long) {
            val data = workDataOf("title" to title, "message" to message)
            val request = OneTimeWorkRequestBuilder<CultReminderWorker>()
                .setInitialDelay(delayMinutes, TimeUnit.MINUTES)
                .setInputData(data)
                .addTag(tag)
                .build()
            WorkManager.getInstance(context).enqueueUniqueWork(tag, ExistingWorkPolicy.REPLACE, request)
        }
    }
}
