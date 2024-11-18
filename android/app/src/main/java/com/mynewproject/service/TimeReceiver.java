package com.mynewproject.service;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;

public class TimeReceiver extends BroadcastReceiver {

    private static final String TAG = "TimeReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String packageName = intent.getStringExtra("packageName");

        // Log the event indicating that the alarm was triggered
        Log.d(TAG, "Alarm triggered for package: " + packageName);

        // Attempt to open the specified app
        openApp(context, packageName);

        // Increment the app's launch count in the database
        incrementAppLaunchCount(context, packageName);
    }

    private void openApp(Context context, String packageName) {
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launchIntent);
            Log.d(TAG, "App launched successfully: " + packageName);
        } else {
            Log.e(TAG, "App not found: " + packageName);
        }
    }

    private void incrementAppLaunchCount(Context context, String packageName) {
        new Thread(() -> {
            AppDB appDB = AppDB.getInstance(context);
            App app = appDB.appDao().getAppByPackageName(packageName);

            if (app != null) {
                appDB.appDao().incrementCount(app.getAppId());
                Log.d(TAG, "App launch count incremented for package: " + packageName);
            } else {
                Log.e(TAG, "App not found in database: " + packageName);
            }
        }).start();
    }
}