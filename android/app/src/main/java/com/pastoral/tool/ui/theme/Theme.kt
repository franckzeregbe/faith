package com.pastoral.tool.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = FaithPrimary,
    onPrimary = FaithOnPrimary,
    primaryContainer = FaithPrimaryContainer,
    onPrimaryContainer = FaithOnPrimaryContainer,
    secondary = FaithSecondary,
    background = FaithBackground,
    surface = FaithSurface,
    error = FaithError
)

private val DarkColorScheme = darkColorScheme(
    primary = FaithPrimary,
    onPrimary = FaithOnPrimary,
    primaryContainer = FaithPrimaryContainer,
    onPrimaryContainer = FaithOnPrimaryContainer,
    secondary = FaithSecondary,
    background = Color(0xFF1C110B),
    surface = Color(0xFF2D1F16),
    error = FaithError
)

@Composable
fun FAITHTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
