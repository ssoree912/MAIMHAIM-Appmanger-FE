
package com.mynewproject.geofence;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.location.Location; // Location 클래스 import
import android.util.Log;

import com.google.android.gms.location.FusedLocationProviderClient; // FusedLocationProviderClient import
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;


import java.util.ArrayList;
import java.util.List;
import com.mynewproject.GeofenceBroadcastReceiver;


public class GeofenceHelper {

    private Context context;

    public GeofenceHelper(Context context) {
        this.context = context;
    }

    public void setupGeofences() {
        List<Geofence> geofenceList = new ArrayList<>();

        // 위치 데이터를 기반으로 지오펜스 추가
        for (LocationData location : LocationDataStore.LOCATIONS) {
            geofenceList.add(new Geofence.Builder()
                    .setRequestId(location.getId())
                    .setCircularRegion(location.getLatitude(), location.getLongitude(), location.getRadius())
                    .setExpirationDuration(Geofence.NEVER_EXPIRE)
                    .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER)
                    .build());
        }

        GeofencingRequest geofencingRequest = new GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofences(geofenceList)
                .build();

        Intent intent = new Intent(context, GeofenceBroadcastReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE // 수정된 부분
        );

        LocationServices.getGeofencingClient(context)
                .addGeofences(geofencingRequest, pendingIntent)
                .addOnSuccessListener(aVoid -> Log.d("GeofenceHelper", "Geofence 설정 성공"))
                .addOnFailureListener(e -> Log.e("GeofenceHelper", "Geofence 설정 실패: " + e.getMessage()));
    }
    public void checkCurrentLocation(Context context) {
        FusedLocationProviderClient fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(location -> {
                    if (location != null) {
                        double latitude = location.getLatitude();
                        double longitude = location.getLongitude();

                        for (LocationData geofence : LocationDataStore.LOCATIONS) {
                            float[] results = new float[1];
                            Location.distanceBetween(latitude, longitude, geofence.getLatitude(), geofence.getLongitude(), results);
                            if (results[0] <= geofence.getRadius()) {
                                Log.d("GeofenceHelper", "현재 위치가 지오펜스 내부에 있습니다: " + geofence.getId());
                                triggerEvent(geofence.getId()); // 지오펜스 이벤트 강제 트리거
                            }
                        }
                    } else {
                        Log.e("GeofenceHelper", "현재 위치를 가져올 수 없습니다.");
                    }
                })
                .addOnFailureListener(e -> Log.e("GeofenceHelper", "현재 위치를 확인하는 중 오류 발생: " + e.getMessage()));
    }

    private void triggerEvent(String geofenceId) {
        if ("starbucks".equals(geofenceId)) {
            // 앱 실행 로직
            Intent intent = new Intent(context, GeofenceBroadcastReceiver.class);
            intent.putExtra("geofenceId", geofenceId);
            context.sendBroadcast(intent);
            Log.d("GeofenceHelper", "지오펜스 이벤트 강제 트리거됨: " + geofenceId);
        }
    }

}
