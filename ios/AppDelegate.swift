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
  
  var rssiValues: [Double] = []
  var kalmanFilter = KalmanFilter()
  let movingAverageWindow = 5
  
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
    locationManager?.requestAlwaysAuthorization()
    startMonitoringBeacon()
    return true
  }
  
  
  @objc func sourceURL(for bridge: RCTBridge) -> URL? {
#if DEBUG
    //      연결되어있는 ip로 바꿔야함
    return URL(string: "http://10.223.115.168:8081/index.bundle?platform=ios&dev=true")
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
//      print("[LOG] Live Activities are not authorized")
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
  // MARK: - Beacon Monitoring
  func startMonitoringBeacon() {
    guard let uuid = UUID(uuidString: "74278bda-b644-4520-8f0c-720eaf059935") else { return }
    let beaconConstraint = CLBeaconIdentityConstraint(uuid: uuid, major: 40011, minor: 44551)
    let beaconRegion = CLBeaconRegion(beaconIdentityConstraint: beaconConstraint, identifier: "TestBeacon")
    beaconRegion.notifyOnEntry = true
    beaconRegion.notifyOnExit = true
    locationManager?.startMonitoring(for: beaconRegion)
    locationManager?.startRangingBeacons(satisfying: beaconConstraint)
    print("[LOG] Started monitoring beacon")
  }
  
  func locationManager(_ manager: CLLocationManager, didRange beacons: [CLBeacon], satisfying constraint: CLBeaconIdentityConstraint) {
    guard let beacon = beacons.first else {
      print("[LOG] No beacons detected")
      return
    }
    
    // 거리 계산용 RSSI 값들
    let rawRSSI = Double(beacon.rssi)
    if rawRSSI == 0 { // 신호가 없는 경우
      print("[LOG] No valid RSSI data")
      return
    }
    
    // RSSI 필터링 값 계산
    movingAverage = calculateMovingAverage(newRSSI: rawRSSI)
    kalmanRSSI = applyKalmanFilter(rssi: rawRSSI)
    let combinedRSSI = (movingAverage + kalmanRSSI) / 2
    
    // 거리 추정
    let rawDistance = calculateDistanceFromRSSI(rssi: rawRSSI)
    let movingAverageDistance = calculateDistanceFromRSSI(rssi: movingAverage)
    let kalmanDistance = calculateDistanceFromRSSI(rssi: kalmanRSSI)
    let combinedDistance = calculateDistanceFromRSSI(rssi: combinedRSSI)
    
    // 로그 출력
    print("[LOG] Raw RSSI: \(rawRSSI)")
    print("[LOG] Moving Average RSSI: \(movingAverage)")
    print("[LOG] Kalman Filter RSSI: \(kalmanRSSI)")
    print("[LOG] Combined RSSI (Kalman + Moving Average): \(combinedRSSI)")
    print("[LOG] Raw Distance: \(rawDistance) meters")
    print("[LOG] Moving Average Distance: \(movingAverageDistance) meters")
    print("[LOG] Kalman Filter Distance: \(kalmanDistance) meters")
    print("[LOG] Combined Distance (Kalman + Moving Average): \(combinedDistance) meters")
    
    // 거리 상태 변경 확인
    if beacon.proximity != previousProximity {
      switch beacon.proximity {
      case .immediate, .near:
        if !hasNotificationBeenSent {
          sendNotificationForAppLaunch()
          hasNotificationBeenSent = true
//          print("[LOG] Notification for entry sent")
        }
      case .far:
        if hasNotificationBeenSent {
          sendExitNotification()
          hasNotificationBeenSent = false
//          print("[LOG] Notification for exit sent")
        }
      default:
        hasNotificationBeenSent = true
        hasNotificationBeenSent = true
//        print("[LOG] Proximity unknown or unchanged")
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
  func calculateDistanceFromRSSI(rssi: Double) -> Double {
      let txPower = -59 // 비콘의 TxPower 값을 정확히 설정
      return pow(10.0, (Double(txPower) - rssi) / (10 * 2)) // n = 2 (free-space)
  }
  var movingAverage: Double = 0.0
  var movingAverageCount: Int = 0

  func calculateMovingAverage(newRSSI: Double) -> Double {
      movingAverageCount += 1
      movingAverage = (movingAverage * Double(movingAverageCount - 1) + newRSSI) / Double(movingAverageCount)
      return movingAverage
  }
  var kalmanRSSI: Double = 0.0
  var kalmanProcessNoise: Double = 1.0 // Q
  var kalmanMeasurementNoise: Double = 2.0 // R
  var kalmanEstimateError: Double = 1.0
  var kalmanLastEstimate: Double = 0.0

  func applyKalmanFilter(rssi: Double) -> Double {
      if kalmanRSSI == 0.0 {
          kalmanRSSI = rssi // 초기 RSSI 값 설정
      }

      let prediction = kalmanLastEstimate
      kalmanEstimateError += kalmanProcessNoise

      let kalmanGain = kalmanEstimateError / (kalmanEstimateError + kalmanMeasurementNoise)
      kalmanRSSI = prediction + kalmanGain * (rssi - prediction)
      kalmanEstimateError = (1 - kalmanGain) * kalmanEstimateError
      kalmanLastEstimate = kalmanRSSI

      return kalmanRSSI
  }
  
}
