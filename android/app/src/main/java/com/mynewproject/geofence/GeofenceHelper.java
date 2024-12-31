package com.mynewproject.geofence;

import android.Manifest;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;

import java.util.ArrayList;
import java.util.List;

import com.mynewproject.GeofenceBroadcastReceiver;
import com.mynewproject.geofence.LocationDataStore;


public class GeofenceHelper {
    private final List<String> activeGeofenceIds = new ArrayList<>();

    private static final String TAG = "GeofenceHelper";
    private Context context;
    private final GeofencingClient geofencingClient; // GeofencingClient를 멤버 변수로 추가

    public GeofenceHelper(Context context) {
        this.context = context;
        this.geofencingClient = LocationServices.getGeofencingClient(context); // GeofencingClient 초기화
    }

    public void setupGeofences() {
        List<Geofence> geofenceList = new ArrayList<>();

        // 위치 데이터를 기반으로 지오펜스 추가
        for (LocationData location : LocationDataStore.LOCATIONS) {
            Log.d(TAG, "Setting up geofence with details: " +
                    "ID=" + location.getId() +
                    ", Latitude=" + location.getLatitude() +
                    ", Longitude=" + location.getLongitude() +
                    ", Radius=" + location.getRadius()
            );

            geofenceList.add(new Geofence.Builder()
                    .setRequestId(location.getId())
                    .setCircularRegion(location.getLatitude(), location.getLongitude(), location.getRadius())
                    .setExpirationDuration(Geofence.NEVER_EXPIRE)
                    .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER)
                    .build());

            activeGeofenceIds.add(location.getId());

        }
        GeofencingRequest geofencingRequest = new GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofences(geofenceList)
                .build();

        Log.d(TAG, "Geofencing request created.");

        // Intent 생성 및 내용 로깅
        Intent intent = new Intent(context, GeofenceBroadcastReceiver.class);
        intent.setAction("com.google.android.gms.location.Geofence.ACTION_GEOFENCE_EVENT");

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0, // Request code can be 0
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE // Use FLAG_MUTABLE
        );

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Location permission not granted. Cannot set up geofences.");
            return;
        }
        Log.d(TAG, "Attempting to add geofences via LocationServices.");

        LocationServices.getGeofencingClient(context)
                .addGeofences(geofencingRequest, pendingIntent)
                .addOnSuccessListener(aVoid -> {
                    Log.d(TAG, "Geofence setup succeeded.");
                    Log.d(TAG, "Active geofences: " + activeGeofenceIds);
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Geofence setup failed with error: " + e.getMessage());
                    if (e != null) {
                        Log.e(TAG, "Error details: " + e.toString());
                    }
                });
    }


    public void checkCurrentLocation() {
        FusedLocationProviderClient fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "Location permission not granted. Cannot check current location.");
            return;
        }

        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(location -> {
                    if (location != null) {
                        double latitude = location.getLatitude();
                        double longitude = location.getLongitude();

                        for (LocationData geofence : LocationDataStore.LOCATIONS) {
                            float[] results = new float[1];
                            Location.distanceBetween(latitude, longitude, geofence.getLatitude(), geofence.getLongitude(), results);
                            if (results[0] <= geofence.getRadius()) {
                                Log.d(TAG, "현재 위치가 지오펜스 내부에 있습니다: " + geofence.getId());
                                // 필요한 동작을 여기에 추가
                            }
                        }
                    } else {
                        Log.e(TAG, "현재 위치를 가져올 수 없습니다.");
                    }
                })
                .addOnFailureListener(e -> Log.e(TAG, "현재 위치를 확인하는 중 오류 발생: " + e.getMessage()));
    }
}
