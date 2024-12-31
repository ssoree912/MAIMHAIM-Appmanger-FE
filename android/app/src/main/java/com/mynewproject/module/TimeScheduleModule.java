// TimeScheduleModule.java
package com.mynewproject.module;

import android.content.Context;
import android.util.Log;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;
import com.mynewproject.db.TriggerType;
import com.mynewproject.service.TimeService;

public class TimeScheduleModule extends ReactContextBaseJavaModule {
    private static final String TAG = "TimeScheduleModule";
    private final AppDB appDB;

    public TimeScheduleModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.appDB = AppDB.getInstance(reactContext); // Room DB 인스턴스 가져오기
    }

    @NonNull
    @Override
    public String getName() {
        return "TimeScheduleModule";
    }

    // React Native에서 호출하여 알람을 설정하는 메서드
    @ReactMethod
    public void setTimeSchedule(String packageName, String week, String time, Promise promise) {
        try {
            Log.d(TAG, "Alarm set for package: " + packageName + ", week: " + week + ", time: " + time);
            if(!packageName.isBlank()){
                updateTime(packageName, week, time);
                promise.resolve("Alarm set successfully");
            }else {
                promise.reject("ERROR", "null");
            }
            // `time`이 4자리 형식인지 확인하고 `05:15:00` 형식으로 변환
        } catch (Exception e) {
            Log.e(TAG, "Failed to set alarm", e);
            promise.reject("ERROR", "Failed to set alarm");
        }
    }

    public void updateTime(String packageName, String week, String time) {
        TimeService timeService = new TimeService(getReactApplicationContext());
        new Thread(() -> {
            App app = appDB.appDao().getAppByPackage(packageName);
            Log.d(TAG, "updateTime: " + packageName + ", week: " + week + ", time: " + time);
            if(app.isActivate()&& app.isAdd() && app.isAdvancedMode()){
                appDB.appDao().updateTimeAndWeek(packageName,week,time);
                appDB.appDao().updateTriggerType(packageName, TriggerType.TIME);
                timeService.scheduleAppOpen(packageName, week, time);
            }

        }).start();
    }
}