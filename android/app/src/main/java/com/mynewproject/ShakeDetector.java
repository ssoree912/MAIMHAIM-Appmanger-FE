package com.mynewproject;

import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.util.Log;

public class ShakeDetector implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor accelerometer;

    private static final float SHAKE_THRESHOLD = 50.0f; // 흔들림 감지 임계값
    private static final int SHAKE_TIME_LAPSE = 1000; // 밀리초 단위

    private long lastShakeTime;
    private Context context;  // Context를 멤버 변수로 선언

    public ShakeDetector(Context context) {
        this.context = context; // Context 초기화
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }
    }

    // 흔들림 감지 시작
    public void start() {
        if (accelerometer != null && sensorManager != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI);
        }
    }

    public void stop() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];

            // 가속도 크기 계산
            float acceleration = (float) Math.sqrt(x * x + y * y + z * z);
            long currentTime = System.currentTimeMillis();

            // 강도에 따라 다른 시간 간격 설정
            int dynamicTimeLapse = (acceleration > 70) ? 500 : SHAKE_TIME_LAPSE;

            // 임계값 이상 가속도 발생 시 흔들림 감지
            if (acceleration > SHAKE_THRESHOLD && (currentTime - lastShakeTime) > SHAKE_TIME_LAPSE) {
                lastShakeTime = currentTime;
                onShakeDetected();
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // 사용하지 않음
    }

    // 흔들림 감지 시 실행할 동작
    private void onShakeDetected() {
        Log.d("ShakeDetector", "핸드폰이 흔들렸습니다!");
        if (context != null) {
            // 흔들림 이벤트 전송
            Intent intent = new Intent(context, LocationForegroundService.class);
            intent.putExtra("shake_detected", true);
            context.startService(intent);
        }
    }
}