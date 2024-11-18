package com.mynewproject.module;

import android.content.Intent;
import android.util.Log;
import android.widget.Toast; // 추가된 import 문

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mynewproject.MainActivity; // 정확한 경로로 수정

public class ForegroundServiceModule extends ReactContextBaseJavaModule {

    private static final String TAG = "ForegroundServiceModule";

    public ForegroundServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "ForegroundService";
    }

    @ReactMethod
    public void startService(Promise promise) {
        try {
            MainActivity activity = (MainActivity) getCurrentActivity();
            if (activity != null) {
                activity.startForegroundService();
                Log.d(TAG, "Foreground service started from Java module.");
                promise.resolve(true); // Resolve promise with success
            } else {
                // MainActivity가 null일 때 Toast 메시지를 보여줍니다.
                if (activity != null) {
                    Toast.makeText(activity.getApplicationContext(),
                            "처음 오신걸 환영해요 슬라이드를 좌우로 한번 움직여 보세요!",
                            Toast.LENGTH_LONG).show();
                } else {
                    promise.reject("ACTIVITY_NULL", "MainActivity is null, cannot start service");
                }
            }
        } catch (Exception e) {
            promise.reject("SERVICE_START_ERROR", e);
        }
    }


    @ReactMethod
    public void stopService(Promise promise) {
        try {
            MainActivity activity = (MainActivity) getCurrentActivity();
            if (activity != null) {
                activity.stopForegroundService();
                Log.d(TAG, "Foreground service stopped from Java module.");
                promise.resolve(true); // Resolve promise with success
            } else {
                promise.reject("ACTIVITY_NULL", "MainActivity is null, cannot stop service");
            }
        } catch (Exception e) {
            promise.reject("SERVICE_STOP_ERROR", e);
        }
    }
}