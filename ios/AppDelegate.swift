import UIKit
import CoreLocation
import UserNotifications
import React

@objc(AppDelegate)
class AppDelegate: UIResponder, UIApplicationDelegate, CLLocationManagerDelegate, UNUserNotificationCenterDelegate, RCTBridgeDelegate {
    var window: UIWindow?
    var locationManager: CLLocationManager?
    var beaconConstraint: CLBeaconIdentityConstraint?
    var previousProximity: CLProximity? = .unknown
    var hasNotificationBeenSent: Bool = false // 알림 발송 여부를 추적하는 변수

    override init() {
        super.init()
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.allowsBackgroundLocationUpdates = true
        locationManager?.pausesLocationUpdatesAutomatically = false
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        print("[LOG] LocationManager initialized")
    }

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        print("[LOG] Application did finish launching")
        let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
        let rootView = RCTRootView(bridge: bridge!, moduleName: "MyNewProject", initialProperties: nil)

        let rootViewController = UIViewController()
        rootViewController.view = rootView

        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = rootViewController
        window?.makeKeyAndVisible()

        // UNUserNotificationCenter 설정
        let notificationCenter = UNUserNotificationCenter.current()
        notificationCenter.delegate = self
        notificationCenter.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("[LOG] Notification authorization granted")
                self.setupNotificationActions() // 알림 액션 설정
            } else if let error = error {
                print("[LOG] Notification Authorization Error: \(error)")
            }
        }

        // 비콘 탐지 설정
        setupBeaconConstraint()

        return true
    }

    @objc func sourceURL(for bridge: RCTBridge) -> URL? {
        #if DEBUG
        print("[LOG] Running in DEBUG mode")
        return URL(string: "http://192.168.219.101:8081/index.bundle?platform=ios&dev=true")
        #else
        print("[LOG] Running in RELEASE mode")
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }

    func setupNotificationActions() {
        // "Open" 버튼 액션 정의
        let openAction = UNNotificationAction(
            identifier: "OPEN_STARBUCKS_ACTION",
            title: "Open",
            options: [.foreground] // 앱을 열도록 설정
        )

        // 알림 카테고리 정의
        let category = UNNotificationCategory(
            identifier: "BEACON_NOTIFICATION",
            actions: [openAction], // "Open" 액션 추가
            intentIdentifiers: [],
            options: []
        )

        // 알림 카테고리 등록
        UNUserNotificationCenter.current().setNotificationCategories([category])
    }

    func setupBeaconConstraint() {
        guard let uuid = UUID(uuidString: "74278bda-b644-4520-8f0c-720eaf059935") else {
            print("[LOG] Invalid UUID")
            return
        }

        beaconConstraint = CLBeaconIdentityConstraint(uuid: uuid, major: 40011, minor: 44551)

        // Monitoring 시작
        if let constraint = beaconConstraint {
            let beaconRegion = CLBeaconRegion(beaconIdentityConstraint: constraint, identifier: "StarbucksBeacon")
            beaconRegion.notifyOnEntry = true
            beaconRegion.notifyOnExit = true

            locationManager?.startMonitoring(for: beaconRegion)
            locationManager?.startRangingBeacons(satisfying: constraint)
            print("[LOG] Started monitoring and ranging for beacon region: \(beaconRegion.identifier)")
        }
    }

    func locationManager(_ manager: CLLocationManager, didRange beacons: [CLBeacon], satisfying constraint: CLBeaconIdentityConstraint) {
        guard let beacon = beacons.first else {
            print("[LOG] No beacons detected")
            return
        }

        // Proximity 값 로깅
        let proximityString: String
        switch beacon.proximity {
        case .immediate:
            proximityString = "Immediate"
        case .near:
            proximityString = "Near"
        case .far:
            proximityString = "Far"
        case .unknown:
            proximityString = "Unknown"
        @unknown default:
            proximityString = "Unhandled"
        }

        print("[LOG] Beacon detected: UUID: \(beacon.uuid), Major: \(beacon.major), Minor: \(beacon.minor), Proximity: \(proximityString), Accuracy: \(beacon.accuracy), RSSI: \(beacon.rssi)")

        // 거리 상태 변경 확인
        if beacon.proximity != previousProximity {
            switch beacon.proximity {
            case .immediate, .near:
                if !hasNotificationBeenSent {
                    sendNotificationForAppLaunch()
                    hasNotificationBeenSent = true
                    print("[LOG] Notification for entry sent")
                }
            case .far:
                if hasNotificationBeenSent {
                    sendExitNotification()
                    hasNotificationBeenSent = false
                    print("[LOG] Notification for exit sent")
                }
            default:
                print("[LOG] Proximity unknown or unchanged")
            }
            previousProximity = beacon.proximity
        }
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        print("[LOG] Application entered background")
        if let constraint = beaconConstraint {
            locationManager?.startRangingBeacons(satisfying: constraint)
            print("[LOG] Started ranging beacons in background")
        }
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        print("[LOG] Application entered foreground")
        if let constraint = beaconConstraint {
            locationManager?.startRangingBeacons(satisfying: constraint)
            print("[LOG] Started ranging beacons in foreground")
        }
    }

    func sendNotificationForAppLaunch() {
        print("[LOG] Sending notification for app launch")
        let notification = UNMutableNotificationContent()
        notification.title = "Starbucks Nearby!"
        notification.body = "Would you like to open the Starbucks app?"
        notification.sound = .default
        notification.categoryIdentifier = "BEACON_NOTIFICATION" // 카테고리 설정

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[LOG] Error sending notification: \(error)")
            } else {
                print("[LOG] Notification sent successfully")
            }
        }
    }

    func sendExitNotification() {
        print("[LOG] Sending exit notification")
        let notification = UNMutableNotificationContent()
        notification.title = "You left Starbucks!"
        notification.body = "You are now far from the beacon."
        notification.sound = .default

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[LOG] Error sending exit notification: \(error)")
            } else {
                print("[LOG] Exit notification sent successfully")
            }
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        if response.actionIdentifier == "OPEN_STARBUCKS_ACTION" {
            // "Open" 버튼 클릭 시 starbucks:// 로 이동
            if let url = URL(string: "starbucks://"), UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                print("[LOG] Opened Starbucks app via URL scheme")
            } else {
                print("[LOG] Unable to open Starbucks app via URL scheme")
            }
        }

        completionHandler()
    }
}
