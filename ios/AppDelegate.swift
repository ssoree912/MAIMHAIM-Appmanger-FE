import UIKit
import CoreLocation
import UserNotifications
import React
import ActivityKit

@objc(AppDelegate)
class AppDelegate: UIResponder, UIApplicationDelegate, CLLocationManagerDelegate, UNUserNotificationCenterDelegate, RCTBridgeDelegate {
    var window: UIWindow?
    var locationManager: CLLocationManager?
    var beaconConstraint: CLBeaconIdentityConstraint?
    var previousProximity: CLProximity? = .unknown
    var hasNotificationBeenSent: Bool = false // 알림 발송 여부를 추적하는 변수
    var currentCount: Int = 0 // 다이나믹 아일랜드 카운트 업데이트

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
                self.setupNotificationActions()
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
//      연결되어있는 ip로 바꿔야함
        return URL(string: "http://192.168.219.101:8081/index.bundle?platform=ios&dev=true")
        #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }

    // MARK: - Dynamic Island Live Activity
    func startOrUpdateLiveActivity() {
        currentCount += 1

        // Live Activity 실행 또는 업데이트
        if Activity<DynamicIslandWidgetAttributes>.activities.isEmpty {
            startLiveActivity(count: currentCount)
        } else {
            updateLiveActivity(newCount: currentCount)
        }
    }

    func startLiveActivity(count: Int) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            print("[LOG] Live Activities are not authorized")
            return
        }

        let attributes = DynamicIslandWidgetAttributes(name: "Beacon Tracker")
        let initialState = DynamicIslandWidgetAttributes.ContentState(count: count)

        do {
            let content = ActivityContent(
                state: initialState,
                staleDate: nil
            )

            let activity = try Activity<DynamicIslandWidgetAttributes>.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )
            print("[LOG] Live Activity started: \(activity.id)")
        } catch {
            print("[LOG] Failed to start Live Activity: \(error.localizedDescription)")
        }
    }

    func updateLiveActivity(newCount: Int) {
        guard let activity = Activity<DynamicIslandWidgetAttributes>.activities.first else {
            print("[LOG] No active Live Activity found")
            return
        }

        let updatedState = DynamicIslandWidgetAttributes.ContentState(count: newCount)

        Task {
            await activity.update(using: updatedState)
            print("[LOG] Live Activity updated to count: \(newCount)")
        }
    }

    // MARK: - Beacon Monitoring
    func setupBeaconConstraint() {
        guard let uuid = UUID(uuidString: "74278bda-b644-4520-8f0c-720eaf059935") else {
            print("[LOG] Invalid UUID")
            return
        }

        beaconConstraint = CLBeaconIdentityConstraint(uuid: uuid, major: 40011, minor: 44551)

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

        // 조건과 관계없이 항상 Dynamic Island 업데이트
        startOrUpdateLiveActivity()
    }

    // MARK: - Notifications
    func setupNotificationActions() {
        let openAction = UNNotificationAction(
            identifier: "OPEN_STARBUCKS_ACTION",
            title: "Open",
            options: [.foreground]
        )

        let category = UNNotificationCategory(
            identifier: "BEACON_NOTIFICATION",
            actions: [openAction],
            intentIdentifiers: [],
            options: []
        )

        UNUserNotificationCenter.current().setNotificationCategories([category])
    }

    func sendNotificationForAppLaunch() {
        let notification = UNMutableNotificationContent()
        notification.title = "Starbucks Nearby!"
        notification.body = "Would you like to open the Starbucks app?"
        notification.sound = .default
        notification.categoryIdentifier = "BEACON_NOTIFICATION"

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
