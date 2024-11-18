package com.mynewproject

import android.app.*
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat

class LightSensorService : Service(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private var lightSensor: Sensor? = null
    private var proximitySensor: Sensor? = null
    private var tapCount = 0
    private var isLowLight = false
    private lateinit var wakeLock: PowerManager.WakeLock
    private val resetHandler = Handler(Looper.getMainLooper())
    private val resetTapCountRunnable = Runnable { resetTapCount() }

    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(SensorManager::class.java)
        lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)
        proximitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY)
        wakeLock = (getSystemService(PowerManager::class.java)).run {
            newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::SensorWakeLock").apply { acquire() }
        }
        startForegroundService()
    }

    private fun startForegroundService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "ForegroundServiceChannel", "Sensor Service", NotificationManager.IMPORTANCE_DEFAULT
            )
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
        }
        startForeground(1, NotificationCompat.Builder(this, "ForegroundServiceChannel")
            .setContentTitle("Sensor Monitoring Service")
            .setContentText("Monitoring light and proximity sensors...")
            .build())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        lightSensor?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_FASTEST) }
        proximitySensor?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_FASTEST) }
        return START_STICKY
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            when (it.sensor.type) {
                Sensor.TYPE_LIGHT -> isLowLight = it.values[0] < 65
                Sensor.TYPE_PROXIMITY -> handleProximitySensor(it.values[0])
            }
            Log.d("onSensorChanged", "tap: " + tapCount)
            if (tapCount > 1) openMyApp()
        }
    }

    private fun handleProximitySensor(proximityValue: Float) {
        if (proximityValue < (proximitySensor?.maximumRange ?: 0f) * 1.5) {
            tapCount++
            resetHandler.removeCallbacks(resetTapCountRunnable)
            resetHandler.postDelayed(resetTapCountRunnable, 1000)
            Log.d("LightSensorService", "tapCount: $tapCount")
        }
    }

    private fun openMyApp() {
        resetTapCount()
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("mynewproject://open")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
            Log.d("LightSensorService", "App opened.")
        } catch (e: Exception) {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.instagram.com")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            })
            Log.d("LightSensorService", "Fallback to Instagram.")
        }
    }

    private fun resetTapCount() {
        tapCount = 0
        isLowLight = false
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onDestroy() {
        super.onDestroy()
        sensorManager.unregisterListener(this)
        if (wakeLock.isHeld) wakeLock.release()
        resetHandler.removeCallbacks(resetTapCountRunnable)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
