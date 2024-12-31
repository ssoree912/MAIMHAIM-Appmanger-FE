package com.mynewproject.location;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class AppLocationStore {
    private static final String PREF_NAME = "AppLocationStore";
    private static final String LOCATION_KEY_PREFIX = "location_";

    // 패키지 이름별 고정된 위치 데이터
    private static final Map<String, JSONObject> FIXED_LOCATIONS = new HashMap<>();

    static {
        try {
            FIXED_LOCATIONS.put("walmart", new JSONObject()
                    .put("location", "Walmart Supercenter")
                    .put("address", "4505 W Charleston Blvd, Las Vegas, NV 89102, USA")
                    .put("latitude", 36.158704)
                    .put("longitude", -115.199187));

            FIXED_LOCATIONS.put("starbucks", new JSONObject()
                    .put("location", "Starbucks (Convention Center)")
                    .put("address", "3150 Paradise Rd, Las Vegas, NV 89109, USA")
                    .put("latitude", 36.131630)
                    .put("longitude", -115.153798));

            FIXED_LOCATIONS.put("costco", new JSONObject()
                    .put("location", "Costco Wholesale")
                    .put("address", "222 S Martin L King Blvd, Las Vegas, NV 89106, USA")
                    .put("latitude", 36.167825)
                    .put("longitude", -115.157683));

            FIXED_LOCATIONS.put("amazon", new JSONObject()
                    .put("location", "Amazon Hub Locker - Moxie")
                    .put("address", "3035 E Tropicana Ave, Las Vegas, NV 89121, USA")
                    .put("latitude", 36.099827)
                    .put("longitude", -115.104259));


        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // 위치 데이터 가져오기
    public static JSONObject getLocationData(String packageName) {
        return FIXED_LOCATIONS.get(packageName);
    }
}
