package com.mynewproject.module;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mynewproject.LocationForegroundService;

public class LeaveHandleModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LeaveHandleModule";


    public LeaveHandleModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "LeaveHandleModule";
    }

    // React Native에서 호출하여 이탈 처리하는 메서드
//    isadd, activce, triggerTypeActive 공동 처리
    @ReactMethod
    public void leaveApp(String name, boolean active , Promise promise) {
        LocationForegroundService locationForegroundService = LocationForegroundService.getInstance();
        Log.d("checkAndHandleWifiExit", "checkAndHandleWifiExit: "+ name);
        try {
            Log.d(TAG, "package: " + name + ", active: " + active );
            if(!name.isBlank()){
                locationForegroundService.checkAndHandleWifiExit(name,active);
                promise.resolve("Leave set successfully");
            }else {
                promise.reject("ERROR", "null");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to set alarm", e);
            promise.reject("ERROR", "Failed to leaveApp");
        }
    }

}
