// 백그라운드 까지 구현해 놓은 코드
package com.mynewproject;

import android.Manifest;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;

import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiNetworkSpecifier;
import android.net.NetworkRequest;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.content.Context;
import android.os.Build; 


import android.os.Bundle;
import android.widget.Toast;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;
import com.facebook.react.ReactActivity;

import java.util.ArrayList;
import java.util.List;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;
import com.mynewproject.service.TimeService;

import android.net.Uri;
import android.provider.Settings;

public class MainActivity extends ReactActivity {
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1; // 위치 권한 요청 코드
    private static final int WIFI_PERMISSION_REQUEST_CODE = 2; // 와이파이 권한 요청 코드
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 3; // 알림 권한 요청 코드
    private static final int PERMISSION_REQUEST_CODE = 100; // 권한 요청 코드 추가
    private static final int SYSTEM_ALERT_WINDOW_PERMISSION_REQUEST_CODE = 1234;
    private WifiManager wifiManager; // Wi-Fi 매니저

    private AppDB appDB = null;
    private TimeService timeService;

    @Override
    protected String getMainComponentName() {
        return "MyNewProject"; // 프로젝트 이름
    }
    private boolean isServiceRunning = false; // Foreground 서비스 상태 관리 변수

    private static final String TAG = "MainActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
            // Foreground Service 시작
        Intent serviceIntent = new Intent(this, LightSensorService.class);
        //startForegroundService();

        // 초기화
        wifiManager = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE); // Wi-Fi 매니저 초기화
        requestLocationPermission(); // 위치 권한 요청

        appDB = AppDB.getInstance(getApplicationContext());
        // AppInfoFetcher 인스턴스 생성 및 메서드 호출
//        AppInfoFetcher appInfoFetcher = new AppInfoFetcher(this,appDB);
//        appInfoFetcher.getAllInstalledUserAppInfo();
        requestSystemAlertWindowPermission();

        // Initialize TimeService
//        timeService = new TimeService(this);

//        String packageName = "kr.co.symtra.kmuid"; // Replace with the actual package
//        String week = "TTTTTTT";  // Example: Active on all days except Thursday
//        String time = "02:04:00";  // Example: Set to open at 10 AM
//        timeService.scheduleAppOpen(packageName, week, time);
}

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent); // 새로운 Intent 수신 시 처리
    }

    private void handleIntent(Intent intent) {
        if (intent != null && intent.hasExtra("memberId")) {
            int memberId = intent.getIntExtra("memberId", -1);
                // AppInfoFetcher 실행
            AppInfoFetcher appInfoFetcher = new AppInfoFetcher(this,appDB);
            appInfoFetcher.getAllInstalledUserAppInfo();
            Log.d(TAG, "AppInfoFetcher 실행됨 - memberId: " + memberId);
        }
    }
        private void requestLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_BACKGROUND_LOCATION
            }, LOCATION_PERMISSION_REQUEST_CODE);
        } else {
            checkNotificationPermission(); // 알림 권한 확인
            startForegroundService(); // 권한이 허용된 경우 포그라운드 서비스 시작
            startWifiScan(); // Wi-Fi 스캔 시작
        }
    }

    private void checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // Android 13 이상에서 알림 권한 확인
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{
                        Manifest.permission.POST_NOTIFICATIONS
                }, NOTIFICATION_PERMISSION_REQUEST_CODE);
            }
        }
    }

    private void requestSystemAlertWindowPermission() {
        if (!Settings.canDrawOverlays(this)) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, SYSTEM_ALERT_WINDOW_PERMISSION_REQUEST_CODE);
        }
    }
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SYSTEM_ALERT_WINDOW_PERMISSION_REQUEST_CODE) {
            if (Settings.canDrawOverlays(this)) {
                // SYSTEM_ALERT_WINDOW 권한이 허용된 경우
            } else {
                Toast.makeText(this, "SYSTEM_ALERT_WINDOW 권한이 필요합니다.", Toast.LENGTH_SHORT).show();
            }
        }

    }

    // LocationForegroundService.java 에서 Wi-Fi 스캔을 시작하도록 이동
    private void startWifiScan() {
        Intent intent = new Intent(this, LocationForegroundService.class);
        intent.putExtra("startWifiScan", true); // Wi-Fi 스캔 시작 플래그 추가
        ContextCompat.startForegroundService(this, intent);
    }

    // Foreground 서비스 시작 메서드
    public void startForegroundService() {

            Intent serviceIntent = new Intent(this, LocationForegroundService.class);
            ContextCompat.startForegroundService(this, serviceIntent);
            Log.d(TAG, "Foreground 서비스 Java 단에서시작");

    }

    // Foreground 서비스 중지 메서드
    public void stopForegroundService() {

            Intent serviceIntent = new Intent(this, LocationForegroundService.class);
            stopService(serviceIntent);
            Log.d(TAG, "Foreground 서비스 Java 단에서 중지");

    }


    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                checkNotificationPermission(); // 권한이 허용되면 알림 권한 확인
            } else {
                // 권한 거부된 경우 설정으로 이동
                Toast.makeText(this, "위치 권한이 필요합니다.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            }
        } else if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // 알림 권한이 허용됨
            } else {
                // 알림 권한 거부된 경우 설정으로 이동
                Toast.makeText(this, "알림 권한이 필요합니다.", Toast.LENGTH_SHORT).show();
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            }
        }
    }
}