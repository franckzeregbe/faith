package com.pastoral.tool.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = FaithPrimary,
    onPrimary = FaithOnPrimary,
    primaryContainer = FaithPrimaryContainer,
    onPrimaryContainer = FaithOnPrimaryContainer,
    secondary = FaithSecondary,
    onSecondary = FaithOnSecondary,
    secondaryContainer = FaithSecondaryContainer,
    onSecondaryContainer = FaithOnSecondaryContainer,
    tertiary = FaithTertiary,
    onTertiary = FaithOnTertiary,
    tertiaryContainer = FaithTertiaryContainer,
    onTertiaryContainer = FaithOnTertiaryContainer,
    background = FaithBackground,
    onBackground = FaithOnBackground,
    surface = FaithSurface,
    onSurface = FaithOnSurface,
    surfaceVariant = FaithSurfaceVariant,
    onSurfaceVariant = FaithOnSurfaceVariant,
    surfaceContainer = FaithSurfaceContainer,
    surfaceContainerHigh = FaithSurfaceContainerHigh,
    outline = FaithOutline,
    error = FaithError
)

private val DarkColorScheme = darkColorScheme(
    primary = FaithDarkPrimary,
    onPrimary = FaithDarkOnPrimary,
    primaryContainer = FaithDarkPrimaryContainer,
    onPrimaryContainer = FaithDarkOnPrimaryContainer,
    secondary = FaithDarkSecondary,
    onSecondary = FaithDarkOnSecondary,
    secondaryContainer = FaithDarkSecondaryContainer,
    onSecondaryContainer = FaithDarkOnSecondaryContainer,
    tertiary = FaithDarkTertiary,
    onTertiary = FaithDarkOnTertiary,
    tertiaryContainer = FaithDarkTertiaryContainer,
    onTertiaryContainer = FaithDarkOnTertiaryContainer,
    background = FaithDarkBackground,
    onBackground = FaithDarkOnBackground,
    surface = FaithDarkSurface,
    onSurface = FaithDarkOnSurface,
    surfaceVariant = FaithDarkSurfaceVariant,
    onSurfaceVariant = FaithDarkOnSurfaceVariant,
    surfaceContainer = FaithDarkSurfaceContainer,
    surfaceContainerHigh = FaithDarkSurfaceContainerHigh,
    outline = FaithDarkOutline,
    error = FaithDarkError
)

private val FaithShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

@Composable
fun FAITHTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
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
        shapes = FaithShapes,
        content = content
    )
}