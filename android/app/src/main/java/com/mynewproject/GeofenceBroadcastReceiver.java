package com.mynewproject;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;

import java.util.List;

public class GeofenceBroadcastReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        // GeofencingEvent 가져오기
        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);

        if (geofencingEvent == null) {
            Log.e("GeofenceBroadcastReceiver", "GeofencingEvent가 null입니다.");
            return;
        }

        // 오류 확인
        if (geofencingEvent.hasError()) {
            int errorCode = geofencingEvent.getErrorCode();
            Log.e("GeofenceBroadcastReceiver", "Geofencing 오류 코드: " + errorCode);
            return;
        }

        // Geofence 전환 타입 확인
        int geofenceTransition = geofencingEvent.getGeofenceTransition();

        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER || geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {
            List<Geofence> triggeringGeofences = geofencingEvent.getTriggeringGeofences();

            for (Geofence geofence : triggeringGeofences) {
                String requestId = geofence.getRequestId();

                Intent serviceIntent = new Intent(context, LocationForegroundService.class);
                serviceIntent.putExtra("geofence_request_id", requestId);

                if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER) {
                    Log.i("GeofenceBroadcastReceiver", "지오펜스 진입: " + requestId);
                    serviceIntent.putExtra("geofence_transition", "ENTER");
                } else if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {
                    Log.i("GeofenceBroadcastReceiver", "지오펜스 이탈: " + requestId);
                    serviceIntent.putExtra("geofence_transition", "EXIT");
                }

                context.startService(serviceIntent); // LocationForegroundService 호출
            }
        } else {
            Log.e("GeofenceBroadcastReceiver", "잘못된 지오펜스 트리거 타입: " + geofenceTransition);
        }
    }
}
