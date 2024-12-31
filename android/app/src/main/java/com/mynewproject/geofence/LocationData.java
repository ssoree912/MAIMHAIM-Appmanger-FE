package com.mynewproject.geofence;

/**
 * LocationData 클래스는 특정 지오펜스 위치를 정의합니다.
 */
public class LocationData {
    private String id;           // 고유 ID
    private double latitude;     // 위도
    private double longitude;    // 경도
    private float radius;        // 반경 (미터 단위)

    // 생성자
    public LocationData(String id, double latitude, double longitude, float radius) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radius = radius;
    }

    // Getter 메서드
    public String getId() {
        return id;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public float getRadius() {
        return radius;
    }
}
