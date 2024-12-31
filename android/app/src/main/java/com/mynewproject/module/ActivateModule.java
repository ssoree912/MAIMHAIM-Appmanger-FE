package com.mynewproject.module;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.mynewproject.LocationForegroundService;
import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;
import com.mynewproject.db.TriggerType;

public class ActivateModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ActivateModule";
    private final AppDB appDB;


    public ActivateModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.appDB = AppDB.getInstance(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "ActivateModule";
    }

    @ReactMethod
    public void activateApp(String packageName,boolean active , Promise promise) {
        try {
            Log.d(TAG, "package: " + packageName + ", active: " + active );
            if(!packageName.isBlank()){
                updateActivate(packageName, active);
                promise.resolve("active success");
            }else {
                promise.reject("ERROR", "null");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set alarm", e);
            promise.reject("ERROR", "Failed to set alarm");
        }
    }
    @ReactMethod
    public void activateTrigger(String packageName,String type, boolean active , Promise promise) {
        try {
            Log.d(TAG, "package: " + packageName + ", active: " + active );
            if(!packageName.isBlank()){
                TriggerType triggerType = TriggerType.valueOf(type);
                updateTriggerType(packageName, triggerType,active);
                promise.resolve("trigger active success");
            }else {
                promise.reject("ERROR", "null");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set trigger active", e);
            promise.reject("ERROR", "Failed to set alarm");
        }
    }
    @ReactMethod
    public void activateAdvanced(String packageName, boolean active , Promise promise) {
        try {
            Log.d(TAG,"Advanced" + active );
            updateAdvance(packageName,active);
            promise.resolve("trigger active success");
        } catch (Exception e) {
            Log.e(TAG, "Failed to set trigger active", e);
            promise.reject("ERROR", "Failed to set advancedMode");
        }
    }
    @ReactMethod
    public void activateAddApp(ReadableArray packageNames, boolean active , Promise promise) {
        try {
            for (int i = 0; i < packageNames.size(); i++) {
                String packageName = packageNames.getString(i);
                Log.d(TAG,"activateAddApp" + active );
                updateAdd(packageName,active);
                promise.resolve("trigger add success");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set add active", e);
            promise.reject("ERROR", "Failed to set advancedMode");
        }
    }
    private void updateAdd(String packageName, boolean active){
        new Thread(() -> {
            appDB.appDao().addApp(packageName,active);
        }).start();
    }

    private void updateActivate(String packageName, boolean active){
        new Thread(() -> {
            appDB.appDao().activateApp(packageName,active);
        }).start();
    }
    private void updateTriggerType(String packageName, TriggerType type, boolean active) {
        new Thread(() -> {
            appDB.appDao().activateLocationTrigger(packageName, false);
            appDB.appDao().activateTimeTrigger(packageName, false);
            appDB.appDao().activateMotionTrigger(packageName, false);
            switch (type) {
                case LOCATION:
                    appDB.appDao().activateLocationTrigger(packageName, active);
                    break;
                case TIME:
                    appDB.appDao().activateTimeTrigger(packageName, active);
                    break;
                case MOTION:
                    appDB.appDao().activateLocationTrigger(packageName, active);
                    appDB.appDao().activateMotionTrigger(packageName, active);
                    break;
                default:
                    Log.w("updateTriggerType", "Unknown trigger type: " + type);
                    break;
            }
            appDB.appDao().updateTriggerType(packageName,type);
        }).start();
    }

    private void updateAdvance(String packageName, boolean active){
        new Thread(() -> {
            appDB.appDao().updateAdvanced(active,packageName);
        }).start();
    }
}
