package com.mynewproject.geofence;

import java.util.ArrayList;
import java.util.List;
import com.mynewproject.geofence.LocationData;

public class LocationDataStore {
    public static final List<LocationData> LOCATIONS = new ArrayList<>();

    static {
        LOCATIONS.add(new LocationData("KookminUniversity", 37.6105, 126.9971, 100)); // 국민대
        LOCATIONS.add(new LocationData("Gangnam", 37.4979, 127.0276, 150));          // 강남
        LOCATIONS.add(new LocationData("SeoulStation", 37.5551, 126.9707, 120)); //서울역
        LOCATIONS.add(new LocationData("starbucks",  37.4942, 126.97894, 120)); //테스트

    }
}
