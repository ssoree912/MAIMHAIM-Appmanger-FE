package com.mynewproject;

import android.Manifest;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.location.Location;
import android.net.Uri;
import android.net.wifi.ScanResult;
import android.net.wifi.WifiManager;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;
import com.mynewproject.db.AppDatabaseHelper;
import com.mynewproject.db.TriggerType;
import com.mynewproject.manager.NotificationHelper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LocationForegroundService extends Service {

    public static boolean shake_determine = false;
    private long entryStartTime = 0; // Wi-Fi 진입 시 타이머 시작 시간
    private long exitStartTime = 0; // Wi-Fi 이탈 시 타이머 시작 시간
    private static final long DWELL_TIME_THRESHOLD = 3000; // 10초 (진입 또는 이탈을 판단하기 위한 시간 임계값)
    private static final int NOTIFICATION_ID = 1;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private WifiManager wifiManager;
    private WifiStateReceiver wifiStateReceiver;
    private boolean isScanning = false;
    private boolean isHomeWifiDetected = false; // Wi-Fi 감지 여부
    private boolean isStarCheck = false; // 스타벅스 on off
    private boolean isTmoneyCheck = false; // 티머니 on off
    private boolean isKcardCheck = false; // K-card on off
    private boolean isShakeAble = false;
    private String shakePackageName = "";
    private int currentShakeAppId =0;// To store the app ID for shake detection

    public static List<Double> Kalman_List = new ArrayList<>();
    public static List<Double> Particle_List = new ArrayList<>();
    public static List<String> BSSID_List = new ArrayList<>();
    public static List<String> SSID_List = new ArrayList<>();
    public static List<Integer> RSSI_List = new ArrayList<>();
    public static String names;
    public double distance;
    // Wi-Fi 타겟 BSSID 저장을 위한 변수 추가
    private String targetBSSID = null;

    private Map<String, KalmanFilter> kalmanFilters = new HashMap<>();
    private Map<String, ParticleFilter> particleFilters = new HashMap<>();

    private AppDB appDB;  // AppDB 인스턴스 추가
    private String[] packageNames = {"kcard", "tmoney" , "starbucks" , "heromts" , "gs25","oliveyoung","golfzon"};
    private String lastPackageName; // 마지막에 진입한 패키지 이름을 저장
    private double OUTER_BOUNDARY = 1.1;

    private double INNER_BOUNDARY = 1.7;
    private static LocationForegroundService instance;
    ShakeDetector shakeDetector ;
    public static LocationForegroundService getInstance() {
        return instance;
    }
//    리팩토링
    private NotificationHelper notificationHelper;
    private AppDatabaseHelper appDatabaseHelper;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this; // 초기화
        notificationHelper = new NotificationHelper(this);
        appDatabaseHelper = new AppDatabaseHelper(this);


//        createNotificationChannel(); // 알림 채널 생성
//        Notification notification = createNotification();
        startForeground(NOTIFICATION_ID, notificationHelper.createNotification());
        // 서비스 시작을 위해 startService() 또는 startForegroundService() 사용
        Intent serviceIntent = new Intent(this, LightSensorService.class);
        startService(serviceIntent); // 또는 startForegro undService(serviceIntent);


        appDB = AppDB.getInstance(getApplicationContext()); // AppDB 초기화
        // 위치 업데이트 초기화
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        wifiManager = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE); // Wi-Fi 매니저 초기화

        // Wi-Fi 상태 변경 감지를 위한 리시버 등록
        wifiStateReceiver = new WifiStateReceiver();
        IntentFilter filter = new IntentFilter(WifiManager.WIFI_STATE_CHANGED_ACTION);
        registerReceiver(wifiStateReceiver, filter);

        // 초기 Wi-Fi 상태에 따라 스캔 시작
        if (wifiManager.isWifiEnabled()) {
            startWifiScan();
        }

        startLocationUpdates();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        unregisterReceiver(wifiStateReceiver); // 리시버 해제
    }

    // 와이파이 스캔 시작 메서드
    private void startWifiScan() {
        // 스캔이 이미 진행 중이면 메서드 종료
        if (isScanning) return;
        isScanning = true;

        new Thread(() -> {
            while (isScanning) {
                scanWifiNetworks();
                try {
                    Thread.sleep(350); // 5초 간격으로 스캔
                } catch (InterruptedException e) {
                    Log.e("WifiScan", "Wi-Fi 스캔 스레드 중단됨", e);
                    isScanning = false; // 스캔 중단
                }
            }
        }).start();
    }

    // 와이파이 스캔 중지 메서드
    private void stopWifiScan() {
        isScanning = false; // 스캔 중단
    }

    // Wi-Fi 상태 변경을 감지하는 BroadcastReceiver
    private class WifiStateReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            int wifiState = intent.getIntExtra(WifiManager.EXTRA_WIFI_STATE, WifiManager.WIFI_STATE_UNKNOWN);
            if (wifiState == WifiManager.WIFI_STATE_ENABLED) {
                Log.d("WifiStateReceiver", "Wi-Fi가 켜졌습니다. 스캔을 시작합니다.");
                isHomeWifiDetected = false;
                startWifiScan(); // Wi-Fi가 켜지면 스캔 시작
            } else if (wifiState == WifiManager.WIFI_STATE_DISABLED) {
                Log.d("WifiStateReceiver", "Wi-Fi가 꺼졌습니다. 스캔을 중지합니다.");
                stopWifiScan(); // Wi-Fi가 꺼지면 스캔 중지
                isHomeWifiDetected = false; // 이탈 상태로 설정
            }
        }
    }

    // 와이파이 스캔 메서드
    private void scanWifiNetworks() {

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_WIFI_STATE) != PackageManager.PERMISSION_GRANTED) {
            Log.e("WifiScan", "Wi-Fi 권한이 없습니다.");
            return;
        }
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_WIFI_STATE) != PackageManager.PERMISSION_GRANTED) {
            Log.e("WifiScan", "Wi-Fi 권한이 없습니다.");
            return;
        }

        wifiManager.startScan();
        List<ScanResult> wifiList = wifiManager.getScanResults();
        if (wifiList == null || wifiList.isEmpty()) {
            Log.e("WifiScan", "Wi-Fi 스캔 결과가 비어 있습니다.");
            return;
        }

        double processNoise = 1.0;  // 프로세스 노이즈
        double measurementNoise = 2.0;  // 측정 노이즈
        double kalman_rssi;
        double particle_rssi;

        for (ScanResult result : wifiList) {
            String ssid = result.SSID;
            String bssid = result.BSSID;
            int rssi = result.level;

            // packageNames에 포함된 SSID만 필터링
            boolean isTargetSSID = false;
            for (String packageName : packageNames) {
                if (ssid.contains(packageName)) {
                    isTargetSSID = true;
                    break;
                }
            }

            if (!isTargetSSID) {
                continue; // packageNames에 포함되지 않은 AP는 무시
            }


            if(BSSID_List.contains(bssid)){
                continue;
            }

            // BSSID별 Kalman 필터와 Particle 필터 초기화 및 관리
            kalmanFilters.computeIfAbsent(bssid, k -> new KalmanFilter(-69));
            particleFilters.computeIfAbsent(bssid, k -> new ParticleFilter(1000));

            Log.d("scanWifiNetworks", "scanWifiNetworks: " + targetBSSID);
            if(isHomeWifiDetected && !bssid.equals(targetBSSID)){ //해당 와이파이이면 유지?
                continue;
            }

            // BSSID에 해당하는 필터 가져오기
            KalmanFilter kalmanFilter = kalmanFilters.get(bssid);
            ParticleFilter pf = particleFilters.get(bssid);

            // 칼만 필터와 파티클 필터를 사용한 신호 안정화
            kalman_rssi = kalmanFilter.applyKalmanFilter(rssi);
            pf.predict(processNoise);
            pf.updateWeights(kalman_rssi, measurementNoise);
            pf.resample();
            particle_rssi = pf.getEstimatedState();

            // 필터링된 값 저장
            RSSI_List.add(rssi);
            Kalman_List.add(kalman_rssi);
            Particle_List.add(particle_rssi);
            BSSID_List.add(bssid);
            SSID_List.add(ssid);

            // 거리 계산
            distance = Math.pow(10, (-32 - particle_rssi) / (10 * 2));
            if(distance < 10){

                Log.d("WiFiInfo", "SSID: " + ssid +
                        ", BSSID: " + bssid +
                        ", RSSI: " + rssi + "dBm" +
                        ", Distance: " + distance + "m" +
                        ", Kalman_RSSI: " + kalman_rssi + "dBm" +
                        ", Particle_RSSI: " + particle_rssi + "dBm" );
            }
        }

        Log.d("Particle_List", Particle_List.toString());
        Log.d("RSSI_List", RSSI_List.toString());

        if (Particle_List.isEmpty()) {
            Log.e("scanWifiNetworks", "Particle_List가 비어 있습니다.");
            return;
        }

        // 거리 계산 및 알림
        double n = 2.0;
        double txpower = -32;
        double max_rssi;
        int cnt = 0;
        try {
            max_rssi = Collections.max(Particle_List);
        } catch (Exception e) {
            Log.e("scanWifiNetworks", "Particle_List에서 최대값을 가져오는 중 오류 발생: " + e.getMessage());
            return;
        }

        double max_distance = Math.pow(10, (txpower - (double) max_rssi) / (10 * n));
        int maxIndex = Particle_List.indexOf(max_rssi);
        if (maxIndex < 0 || maxIndex >= SSID_List.size() || maxIndex >= BSSID_List.size()) {
            Log.e("scanWifiNetworks", "유효하지 않은 인덱스입니다. maxIndex: " + maxIndex);
            return;
        }

        String SSID_name = SSID_List.get(maxIndex);
        String BSSID_name = BSSID_List.get(maxIndex);

        Log.d("wifi_information", "SSID : " + SSID_name + " BSSID : " + BSSID_name + " DISTANCE : " + max_distance);

        new Handler(Looper.getMainLooper()).post(() -> {
            Toast.makeText(getApplicationContext(),
                    "SSID : " + SSID_name + " BSSID : " + BSSID_name + " DISTANCE : " + distance,
                    Toast.LENGTH_SHORT).show();
        });

//

        long currentTime = System.currentTimeMillis();

        if (max_distance < INNER_BOUNDARY) {

            if (currentTime - entryStartTime >= DWELL_TIME_THRESHOLD && !isHomeWifiDetected) {
                if (SSID_name.contains(packageNames[0])) {
                    handleWifiEntry(packageNames[0], SSID_name, BSSID_name,currentTime);
                } else if (SSID_name.contains(packageNames[1])) {
                    handleWifiEntry(packageNames[1], SSID_name, BSSID_name,currentTime);
                } else if (SSID_name.contains(packageNames[2])) {
                    handleWifiEntry(packageNames[2], SSID_name, BSSID_name,currentTime);
                } else if (SSID_name.contains(packageNames[3])) {
                    handleWifiEntry(packageNames[3], SSID_name, BSSID_name,currentTime);
                } else if (SSID_name.contains(packageNames[4])) {
                    handleWifiEntry(packageNames[4], SSID_name, BSSID_name,currentTime);
                } else if (SSID_name.contains(packageNames[5])) {
                    handleWifiEntry(packageNames[5], SSID_name, BSSID_name,currentTime);
                }else if (SSID_name.contains(packageNames[6])) {
                    handleWifiEntry(packageNames[6], SSID_name, BSSID_name,currentTime);
                }
                exitStartTime = 0; // 재진입 시 이탈 타이머 초기화
            }
            shakeDetector = new ShakeDetector(this);
            if(isShakeAble)  shakeDetector.start();
        } else if (max_distance >=
                OUTER_BOUNDARY) {
            if (exitStartTime == 0) {
                exitStartTime = currentTime;
            }
            if ((names != null && names.equals(SSID_name) && currentTime - exitStartTime >= DWELL_TIME_THRESHOLD && isHomeWifiDetected) || cnt == 4) {
                exitStartTime = 0; // 이탈 후 타이머 초기화
                leaveHandle(SSID_name, false);
            }
        }

        // 필터 리스트 초기화
        Particle_List.clear();
        BSSID_List.clear();
        RSSI_List.clear();
        SSID_List.clear();
        if (shake_determine == true){
            isHomeWifiDetected = true;
            shakeDetector.stop();
            shake_determine = false;
        }
    }

    // 앱 오픈 메서드
    public void openApp(String packageName) {
        Context context = getApplicationContext();
        Intent intent = getPackageManager().getLaunchIntentForPackage(packageName);
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        } else {
            Log.e("openApp", "앱을 열 수 없습니다: " + packageName);
            // 앱이 없을 경우 Google Play 스토어로 이동
            intent = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + packageName));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        }
    }

    private void startLocationUpdates() {
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setInterval(3000); // 3초 간격
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY); // GPS 사용

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult != null) {
                    for (Location location : locationResult.getLocations()) {
                        Log.d("LocationUpdate", "위치 업데이트: " + location.getLatitude() + ", " + location.getLongitude() + ", " + location.getAccuracy());

                        // 위치 데이터를 JSON 객체로 변환하여 React Native로 전송
                        String json = "{\"latitude\": " + location.getLatitude() +
                                ", \"longitude\": " + location.getLongitude() +
                                ", \"altitude\": " + location.getAltitude() +
                                ", \"accuracy\": " + location.getAccuracy() +
                                ", \"speed\": " + location.getSpeed() +
                                ", \"bearing\": " + location.getBearing() +
                                ", \"time\": " + location.getTime() +
                                ", \"isStarCheck\": " + isStarCheck +
                                ", \"isTmoneyCheck\": " + isTmoneyCheck +
                                ", \"isKcardCheck\": " + isKcardCheck + "}";

                        Log.d("LocationUpdate", "전송할 JSON: " + json);

                        sendLocationToReactNative(json); // 위치 데이터 전송
                    }
                } else {
                    Log.e("LocationUpdate", "현재 위치를 찾을 수 없습니다.");
                }
            }
        };

        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
    }



    private void sendLocationToReactNative(String json) {
        ReactApplication context = (ReactApplication) getApplicationContext();
        ReactContext reactContext = context.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();

        if (reactContext != null) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("LocationUpdate", json);
        } else {
            Log.e("LocationForegroundService", "React Native context가 null입니다. 위치 데이터를 전송할 수 없습니다.");
        }
    }
    // Wi-Fi 진입 시 처리 로직을 수행하는 함수
    private void handleWifiEntry(String appName, String SSID_name, String BSSID_name,Long currentTime) {
        new Thread(() -> {
            App getApp = appDB.appDao().getPackageNameByName(appName);
            if (getApp != null) {
                if(getApp.isActivate() && getApp.isAdd() && getApp.isTriggerActive()) {
                    if (entryStartTime == 0) {
                        entryStartTime = currentTime;
                    }
                    targetBSSID = BSSID_name;
                    names = SSID_name;
                    lastPackageName = getApp.getPackageName(); // 마지막으로 진입한 패키지 이름 저장
                    Log.d("wifi_information2", appName + "로 진입함");
                    notificationHelper.sendNotification(SSID_name, appName + "로 진입함", getApp.getPackageName());
                    entryStartTime = 0; // 진입 후 타이머 초기화
                    isHomeWifiDetected = true;
                    if( getApp.isMotionTriggerActive() && (getApp.getTriggerType().equals(TriggerType.MOTION))&&getApp.isAdvancedMode() ){
                        isShakeAble = true;
                        shakePackageName = getApp.getPackageName();
                        currentShakeAppId = getApp.getAppId();  // Store the app ID for future shake events
                    }else {
                        appDB.appDao().incrementCount(getApp.getAppId());
                        openApp(getApp.getPackageName());
                    }
                }
            }
        }).start();
    }
    public void checkAndHandleWifiExit(String SSID_name, boolean active) {
        Log.d("checkAndHandleWifiExit", "checkAndHandleWifiExit: " +(names != null) +(SSID_name!=null) + isHomeWifiDetected );
            if ((names != null && names.contains(SSID_name) && isHomeWifiDetected) ) {
                exitStartTime = 0; // 이탈 후 타이머 초기화
                leaveHandle(SSID_name, active);
            }
    }

    public void leaveHandle(String SSID_name, boolean active) {
        if (!active) {
            notificationHelper.sendNotification(SSID_name, "이탈", lastPackageName);
            isShakeAble = false;

            // SSID_name을 포함하는 패키지를 찾아서 처리
            for (String packageName : packageNames) {
                if (SSID_name.contains(packageName)) {
                    isStarCheck = false;
                    Log.d("wifi_information2", packageName + " 이탈");
                    break;
                }
            }

            // Wi-Fi 상태 및 관련 변수 초기화
            isHomeWifiDetected = false;
            targetBSSID = null; // 이탈 후 타겟 BSSID 초기화
            entryStartTime = 0; // 이탈 시 진입 타이머 초기화
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getBooleanExtra("shake_detected", false) && isShakeAble) {
            shake_determine = true;
            openApp(shakePackageName);
            AppDatabaseHelper.handleShakeEvent(currentShakeAppId,shakePackageName);
            isShakeAble = false;
            shakePackageName = ""; // 흔들기 패키지 초기화
            shakeDetector.stop();
        }
        return START_STICKY;
    }

}