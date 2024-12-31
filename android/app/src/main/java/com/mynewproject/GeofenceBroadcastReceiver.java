package com.mynewproject;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;
import com.mynewproject.geofence.GeofenceHelper;
import java.util.List;

public class GeofenceBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("GeofenceBroadcastReceiver", "Received intent: " + intent);

        if (intent == null) {
            Log.e("GeofenceBroadcastReceiver", "Intent is null.");
            return;
        }

        Log.d("GeofenceBroadcastReceiver", "Intent action: " + intent.getAction());
        Log.d("GeofenceBroadcastReceiver", "Intent extras: " + intent.getExtras());

        // Log all extras key-value pairs
        Bundle extras = intent.getExtras();

        if (extras != null) {
            for (String key : extras.keySet()) {
                Object value = extras.get(key);
                Log.d("GeofenceBroadcastReceiver", "Intent extra: Key=" + key + ", Value=" + value);
            }
        } else {
            Log.e("GeofenceBroadcastReceiver", "Intent extras are null.");
        }

        // GeofencingEvent 생성
        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);
        if (geofencingEvent == null) {
            Log.e("GeofenceBroadcastReceiver", "GeofencingEvent is null.");
            return;
        }

        if (geofencingEvent.hasError()) {
            int errorCode = geofencingEvent.getErrorCode();
            Log.e("GeofenceBroadcastReceiver", "Geofencing error: " + errorCode);
            return;
        }

        // Geofence 전환 타입 확인
        int geofenceTransition = geofencingEvent.getGeofenceTransition();
        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER || geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {
            List<Geofence> triggeringGeofences = geofencingEvent.getTriggeringGeofences();

            for (Geofence geofence : triggeringGeofences) {
                String requestId = geofence.getRequestId();
                Log.i("GeofenceBroadcastReceiver", "Triggered Geofence: " + requestId);

                // LocationForegroundService 호출
                Intent serviceIntent = new Intent(context, LocationForegroundService.class);
                serviceIntent.putExtra("geofence_request_id", requestId);
                serviceIntent.putExtra("geofence_transition", geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER ? "ENTER" : "EXIT");

                context.startForegroundService(serviceIntent); // Foreground Service
            }
        } else {
            Log.e("GeofenceBroadcastReceiver", "Invalid geofence transition: " + geofenceTransition);
        }
    }
}
