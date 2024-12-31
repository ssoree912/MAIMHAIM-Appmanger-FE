package com.mynewproject;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.mynewproject.db.App;
import com.mynewproject.db.AppDB;
import com.mynewproject.db.TriggerType;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.util.List;

public class AppInfoFetcher {
    private final Context context;
    private AppDB appDB;
    private String[] targetPackages = {
            "com.amazon.mShop.android.shopping",
            "bbc.mobile.news.ww",
            "com.cta.cestech",
            "com.cnn.mobile.android.phone",
            "com.costco.app.android",
            "com.fidelity.wi.activity",
            "com.google.android.apps.magazines",
            "com.ingka.ikea.app",
            "com.google.android.apps.tachyon",
            "com.starbucks.mobilecard",
            "com.robinhood.gateway",
            "com.walmart.android",
            "us.zoom.videomeetings",
            "com.costco.dmc.store",
            "com.starbucks.co"
    };
    private String[] names = {
            "amazon",
            "BBC",
            "ces",
            "CNN",
            "COSTCO",
            "fidelity",
            "googlenews",
            "IKEA",
            "googlemeet",
            "STARBUCKS",
            "wallet",
            "walmart",
            "zoom",
            "costco",
            "starbucks"
    };

    public AppInfoFetcher(Context context, AppDB appDB) {
        this.context = context;
        this.appDB = appDB.getInstance(context);  // Room DB 인스턴스 가져오기
    }

    // 모든 앱 정보를 가져와 SQLite에 저장하고, 서버로 전송
    public void getAllInstalledUserAppInfo() {
        Log.d("AppInfoFetcher", "실행");
        try {
            PackageManager pm = context.getPackageManager();
            List<PackageInfo> packages = pm.getInstalledPackages(PackageManager.GET_META_DATA);
            JSONArray appInfoArray = new JSONArray();

            for (PackageInfo packageInfo : packages) {
                ApplicationInfo applicationInfo = packageInfo.applicationInfo;

                    String packageName = packageInfo.packageName;
                    Log.d("getAllInstalledUserAppInfo", "getAllInstalledUserAppInfo: " + packageName);
                    String appName = pm.getApplicationLabel(applicationInfo).toString();
                    int uid = applicationInfo.uid;

                    // targetPackages에 있는 앱인지 확인하여 SQLite에 저장
                    boolean isTargetPackage = false;
                    for (int i = 0; i < targetPackages.length; i++) {
                        if (targetPackages[i].equals(packageName)) {
                            isTargetPackage = true;

                            // App 엔티티 생성 및 데이터베이스에 저장
                            App app = new App();
                            app.setName(appName);
                            app.setApName(names[i]);
                            app.setPackageName(packageName);
                            app.setAdd(false); //일단은 미리 추가한 상태로 둘 예정 프론트가 sqlite 접근 가능할 때 다시 false로
                            app.setActivate(true);
                            TriggerType triggerType = packageName.equals("com.gsr.gs25") ? TriggerType.MOTION : TriggerType.LOCATION;
                            app.setTriggerType(triggerType);
                            app.setTriggerActive(true);
                            app.setForeGround(true);
                            app.setAdvancedMode(false);
                            app.setTimeTriggerActive(false);
                            app.setMotionTriggerActive(packageName.equals("com.gsr.gs25"));
                            app.setTime("");
                            app.setWeek("TTTTTTT");
                            saveAppToDatabase(app);
                            break;
                        }
                    }

                    // 모든 앱을 JSON 배열에 추가
                    JSONObject appInfoJson = new JSONObject();
                    appInfoJson.put("packageName", packageName);
                    appInfoJson.put("uid", uid);
                    appInfoArray.put(appInfoJson);

            }

            // 모든 앱 정보를 서버로 전송
            createApp(appInfoArray);

        } catch (Exception e) {
            Log.e("AppInfo", "Error fetching app info", e);
        }
    }

    private void saveAppToDatabase(App app) {
        new Thread(() -> {
            App existingApp = appDB.appDao().getAppByPackageName(app.getPackageName());

            if (existingApp == null) {
                appDB.appDao().insertAll(app);
                Log.d("AppInfoFetcher", "App saved to database: " + app.getPackageName());
            } else {
                Log.d("AppInfoFetcher", "App already exists in database: " + app.getPackageName());
            }
        }).start();
    }

    // JSON 배열을 받아 서버로 전송하는 함수
    public void createApp(JSONArray appInfoArray) {
        Log.d("AppInfoFetcher", "DB 생성");
        try {
            SharedPreferences sharedPreferences = context.getSharedPreferences("MyAppPrefs", Context.MODE_PRIVATE);
            String memberId = sharedPreferences.getString("memberId", null);

            if (memberId == null) {
                Log.e("AppInfoFetcher", "memberId가 없습니다. 데이터를 서버로 전송하지 않습니다.");
                return;
            }

            // 최종 JSON 객체 생성 및 memberId 추가
            JSONObject finalJson = new JSONObject();
            finalJson.put("memberId", memberId);
            finalJson.put("apps", appInfoArray);

            // 서버로 전송
            sendAppInfoToServer(finalJson);

        } catch (Exception e) {
            Log.e("AppInfo", "Error creating app info JSON", e);
        }
    }

    private void sendAppInfoToServer(JSONObject finalJson) {
        Log.d("AppInfoFetcher", "서버 요청");
        Thread thread = new Thread(() -> {
            try {
//                URL url = new URL("http://192.168.219.102:8080/api/v2/managed-apps");
//                URL url = new URL("http://10.223.123.80:8080/api/v2/managed-apps");
                URL url = new URL("http://54.180.201.68:8080/api/v2/managed-apps");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setDoOutput(true);

                OutputStream os = conn.getOutputStream();
                os.write(finalJson.toString().getBytes("UTF-8"));
                os.close();

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                    Log.d("AppInfo", "App info sent successfully.");
                } else {
                    Log.e("AppInfo", "Failed to send app info. Response code: " + responseCode);
                }

                conn.disconnect();
            } catch (Exception e) {
                Log.e("AppInfo", "Error sending app info to server", e);
            }
        });

        thread.start();
    }
}