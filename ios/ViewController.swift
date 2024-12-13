//import UIKit
//import CoreLocation
//import UserNotifications
//import React // React Native 헤더 추가
//
//class ViewController: UIViewController, CLLocationManagerDelegate {
//    var locationManager: CLLocationManager!
//    var previousProximity: CLProximity?
//    var hasNotificationBeenSent: Bool = false // 알림 발송 여부를 추적하는 변수
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//
//        // React Native Root View 설정
//        setupReactNativeView()
//
//        // Location Manager 초기화
//        locationManager = CLLocationManager()
//        locationManager.delegate = self
//        locationManager.requestAlwaysAuthorization()
//
//        // 비콘 탐지 시작
//        startRangingBeacons()
//
//        // 알림 액션 설정
//        setupNotificationActions()
//    }
//
//    func setupReactNativeView() {
//        // React Native 화면 설정
//        guard let jsCodeLocation = URL(string: "http://192.168.219.101:8081/index.bundle?platform=ios&dev=true") else {
//            print("Invalid URL for React Native")
//            return
//        }
//
//        let rootView = RCTRootView(
//            bundleURL: jsCodeLocation,
//            moduleName: "MyNewProject", // React Native의 moduleName과 동일
//            initialProperties: nil,
//            launchOptions: nil
//        )
//        rootView.frame = self.view.bounds // Optional chaining 제거
//        self.view.addSubview(rootView) // 강제 언래핑 제거
//    }
//
//    func setupNotificationActions() {
//        let openAppAction = UNNotificationAction(identifier: "OPEN_STARBUCKS_APP",
//                                                 title: "Open Starbucks",
//                                                 options: [.foreground])
//
//        let declineAction = UNNotificationAction(identifier: "DECLINE_ACTION",
//                                                 title: "Decline",
//                                                 options: [.destructive])
//
//        let category = UNNotificationCategory(identifier: "BEACON_NOTIFICATION",
//                                              actions: [openAppAction, declineAction],
//                                              intentIdentifiers: [],
//                                              options: [])
//
//        UNUserNotificationCenter.current().setNotificationCategories([category])
//    }
//
//    func startRangingBeacons() {
//        guard let uuid = UUID(uuidString: "74278bda-b644-4520-8f0c-720eaf059935") else {
//            print("Invalid UUID")
//            return
//        }
//
//        let beaconConstraint = CLBeaconIdentityConstraint(uuid: uuid, major: 40011, minor: 44551)
//        locationManager.startRangingBeacons(satisfying: beaconConstraint)
//        print("Started ranging beacons")
//    }
//
//    func locationManager(_ manager: CLLocationManager, didRange beacons: [CLBeacon], satisfying constraint: CLBeaconIdentityConstraint) {
//        // 감지된 비콘 리스트 확인
//        guard let beacon = beacons.first else {
//            print("No beacons detected")
//            return
//        }
//
//        // 특정 Minor 값 필터링
//        let targetMinorValue: NSNumber = 44551 // 원하는 Minor 값 설정
//        if beacon.minor == targetMinorValue {
//            print("Target beacon detected with Minor: \(beacon.minor)")
//
//            // 현재 Proximity 상태 확인
//            let currentProximity = beacon.proximity
//
//            // Proximity 상태가 변경된 경우 처리
//            if currentProximity != previousProximity {
//                       switch currentProximity {
//                       case .immediate, .near:
//                           if !hasNotificationBeenSent {
//                               sendNotificationForAppLaunch()
//                               print("Sending notification for entry")
//                               hasNotificationBeenSent = true // 알림 발송 여부 업데이트
//                           }
//                       case .far:
//                           if hasNotificationBeenSent {
//                               print("Resetting notification status as beacon is far")
//                               hasNotificationBeenSent = false // 알림 발송 상태 초기화
//                               sendExitNotification()
//                           }
//                       case .unknown:
//                           print("Beacon proximity is unknown")
//                       @unknown default:
//                           print("Unhandled proximity value")
//                       }
//                       previousProximity = currentProximity
//                   }
//        } else {
//            print("Non-target beacon detected with Minor: \(beacon.minor)")
//        }
//    }
//
//    func sendNotificationForAppLaunch() {
//        let notification = UNMutableNotificationContent()
//        notification.title = "Starbucks Nearby!"
//        notification.body = "Would you like to open the Starbucks app?"
//        notification.sound = .default
//        notification.categoryIdentifier = "BEACON_NOTIFICATION"
//
//        let request = UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
//        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
//    }
//
//    func sendExitNotification() {
//           let notification = UNMutableNotificationContent()
//           notification.title = "You left Starbucks!"
//           notification.body = "You are now far from the beacon."
//           notification.sound = .default
//           notification.categoryIdentifier = "BEACON_NOTIFICATION"
//
//           let request = UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
//           UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
//       }
//}
