// TimeService.java
package com.mynewproject.service;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;

import java.util.Calendar;

public class TimeService {
    private final Context context;

    public TimeService(Context context) {
        this.context = context;
    }

    @SuppressLint("ScheduleExactAlarm")
    public void scheduleAppOpen(String packageName, String week, String time) {
        Calendar calendar = Calendar.getInstance();
        int currentDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1;
        boolean everyWeek = false;
        Log.d("scheduleAppOpen", "scheduleAppOpen: " + week);
        if(week.equals("FFFFFFF")){
            week = "TTTTTTT";
        }else{
            everyWeek = true;
        }
//        if (week.length() <= currentDayOfWeek || week.charAt(currentDayOfWeek) != 'T') {
//            Log.d("TimeService", "No alarm for today: " + packageName);
//            return;
//        }

        String[] timeParts = time.split(":");
        if (timeParts.length < 3) {
            Log.e("TimeService", "Invalid time format");
            return;
        }

        int hour = Integer.parseInt(timeParts[0]);
        int minute = Integer.parseInt(timeParts[1]);
        int second = Integer.parseInt(timeParts[2]);

        calendar.set(Calendar.HOUR_OF_DAY, hour);
        calendar.set(Calendar.MINUTE, minute);
        calendar.set(Calendar.SECOND, second);
        calendar.set(Calendar.MILLISECOND, 0);

        long triggerTime = calendar.getTimeInMillis();

        if (triggerTime < System.currentTimeMillis()) {
            triggerTime += AlarmManager.INTERVAL_DAY * 7;
        }

        Intent intent = new Intent(context, TimeReceiver.class);
        intent.putExtra("packageName", packageName);
        PendingIntent alarmIntent = PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            if(everyWeek){
                alarmManager.setRepeating(
                        AlarmManager.RTC_WAKEUP,
                        triggerTime,
                        AlarmManager.INTERVAL_DAY * 7, // 매주 반복
                        alarmIntent
                );
                Log.d("TimeService", "Repeating alarm scheduled for " + packageName + " at " + time);
            }else{
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, alarmIntent);
                Log.d("TimeService", "Alarm scheduled for " + packageName + " at " + time);
            }
        }
    }


}