package com.mynewproject.db;

import android.content.Context;
import android.util.Log;

import com.mynewproject.AppInfoFetcher;

public class AppDatabaseHelper {
    private static final String TAG = "AppDatabaseHelper";
    private static AppDB appDB;
    private static AppInfoFetcher appInfoFetcher;
    public AppDatabaseHelper(Context context) {
        this.appDB = AppDB.getInstance(context);
    }


    // 데이터베이스 초기화 및 AppInfoFetcher 설정
    public static void initialize(Context context) {
        if (appDB == null) {
            appDB = AppDB.getInstance(context.getApplicationContext());
            Log.d(TAG, "AppDB initialized");
        }

        if (appInfoFetcher == null) {
            appInfoFetcher = new AppInfoFetcher(context, appDB);
            Log.d(TAG, "AppInfoFetcher initialized");
        }
    }

    // AppInfoFetcher 호출
    public static void fetchAllInstalledApps() {
        if (appInfoFetcher != null) {
            appInfoFetcher.getAllInstalledUserAppInfo();
        } else {
            Log.e(TAG, "AppInfoFetcher is not initialized");
        }
    }

    // AppDB getter 메서드 (필요 시 호출)
    public static AppDB getAppDB() {
        return appDB;
    }

    // Method to handle Wi-Fi entry for a specific app by its name
//    public static void handleWifiEntry(String appName, long entryTime) {
//        new Thread(() -> {
//            App app = appDB.appDao().getPackageNameByName(appName);
//            if (app != null && app.isActivate() && app.isAdd() && app.isTriggerActive()) {
//                Log.d(TAG, "App entered Wi-Fi area: " + appName);
//                app.setLastEntryTime(entryTime); // Optionally set entry time if relevant
//                appDB.appDao().updateApp(app); // Update the app record in the database
//            } else {
//                Log.e(TAG, "App not found or inactive: " + appName);
//            }
//        }).start();
//    }

    // Method to increment app usage count by app ID
    public static void incrementAppUsage(int appId) {
        new Thread(() -> {
            appDB.appDao().incrementCount(appId);
            Log.d(TAG, "App usage count incremented for app ID: " + appId);
        }).start();
    }

    // Method to handle shake detection event for a specific app
    public static void handleShakeEvent(int appId, String packageName) {
        new Thread(() -> {
            App app = appDB.appDao().getAppByPackage(packageName);
            if (app != null && app.isMotionTriggerActive()) {
                Log.d(TAG, "Shake detected for app: " + packageName);
                // Trigger app action based on shake event
                appDB.appDao().incrementCount(appId);
            } else {
                Log.e(TAG, "Shake event not applicable for app ID: " + appId);
            }
        }).start();
    }
}