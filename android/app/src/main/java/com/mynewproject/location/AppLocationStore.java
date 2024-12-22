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
            FIXED_LOCATIONS.put("kcard", new JSONObject()
                    .put("location", "Kookmin Univ")
                    .put("address", "77, Jeongneung-ro, Seongbuk-gu, Seoul, Republic of Korea")
                    .put("latitude", 37.611035490773)
                    .put("longitude", 126.99457310622));

            FIXED_LOCATIONS.put("starbucks", new JSONObject()
                    .put("location", "Starbucks HQ")
                    .put("address", "2401 Utah Ave S, Seattle, WA, USA")
                    .put("latitude", 47.580974)
                    .put("longitude", -122.316275));

            FIXED_LOCATIONS.put("gs25", new JSONObject()
                    .put("location", "GS25 Convenience Store")
                    .put("address", "Some Address, Seoul, Korea")
                    .put("latitude", 37.5650172)
                    .put("longitude", 126.849465));

            FIXED_LOCATIONS.put("golfzon", new JSONObject()
                    .put("location", "Golfzon Park")
                    .put("address", "Some Address, Daejeon, Korea")
                    .put("latitude", 36.35111)
                    .put("longitude", 127.38500));

            FIXED_LOCATIONS.put("hollys", new JSONObject()
                    .put("location", "Hollys Coffee")
                    .put("address", "Some Address, Seoul, Korea")
                    .put("latitude", 37.55639)
                    .put("longitude", 126.93983));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // 위치 데이터 가져오기
    public static JSONObject getLocationData(String packageName) {
        return FIXED_LOCATIONS.get(packageName);
    }
}
