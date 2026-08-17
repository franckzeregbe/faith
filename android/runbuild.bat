@echo off
set JAVA_HOME=C:\PROGRA~1\Android\ANDROI~1\jbr
set ANDROID_HOME=C:\Users\zereg\AppData\Local\Android\Sdk
call gradlew.bat assembleDebug --stacktrace --no-daemon
