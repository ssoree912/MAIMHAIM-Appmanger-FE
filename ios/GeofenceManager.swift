//
//  GeofenceManager.swift
//  MyNewProject
//
//  Created by 하준수 on 12/14/24.
//


import UIKit
import CoreLocation

class GeofenceManager: NSObject, CLLocationManagerDelegate {
    private let locationManager = CLLocationManager()

    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.requestAlwaysAuthorization()
    }

    func startMonitoringGeofence(for identifier: String, latitude: CLLocationDegrees, longitude: CLLocationDegrees, radius: CLLocationDistance) {
        let center = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        let region = CLCircularRegion(center: center, radius: radius, identifier: identifier)

        region.notifyOnEntry = true
        region.notifyOnExit = true

        locationManager.startMonitoring(for: region)
        print("Started monitoring geofence: \(identifier)")
    }

    // Geofence 이벤트 처리
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        guard region is CLCircularRegion else { return }
        handleGeofenceEvent(for: region, didEnter: true)
    }

    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        guard region is CLCircularRegion else { return }
        handleGeofenceEvent(for: region, didEnter: false)
    }

    private func handleGeofenceEvent(for region: CLRegion, didEnter: Bool) {
        let requestId = region.identifier
        if didEnter {
            print("Entered geofence: \(requestId)")
            // Geofence 진입 시 처리 로직
            startService(isCheck: true, requestId: requestId)
        } else {
            print("Exited geofence: \(requestId)")
            // Geofence 이탈 시 처리 로직
            startService(isCheck: false, requestId: requestId)
        }
    }

    private func startService(isCheck: Bool, requestId: String) {
        // 서비스 시작 로직 구현
        let status = isCheck ? "Entry" : "Exit"
        print("Service started for geofence (\(status)): \(requestId)")
        // 예: 백그라운드 작업을 트리거하거나 API 호출
    }

    func locationManager(_ manager: CLLocationManager, monitoringDidFailFor region: CLRegion?, withError error: Error) {
        print("Failed to monitor geofence: \(error.localizedDescription)")
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager error: \(error.localizedDescription)")
    }
}
