import UIKit
import CoreLocation
import UserNotifications
import React
import ActivityKit

@objc(AppDelegate)
class AppDelegate: UIResponder, UIApplicationDelegate, CLLocationManagerDelegate, UNUserNotificationCenterDelegate, RCTBridgeDelegate {
    var window: UIWindow?
    var locationManager: CLLocationManager?
    var previousDistance: [String: Double] = [:] // 비콘별 이전 거리 값 저장
    var notificationState: [String: (hasAppOpened: Bool, hasNotificationBeenSent: Bool)] = [:] // 비콘별 상태 저장
    var hasNotificationBeenSent: Bool = false
    var hasAppOpened: Bool = false
    var currentCount: Int = 0 // 다이나믹 아일랜드 카운트 업데이트
    var selectedBeaconKey: String? // 현재 선택된 비콘의 키 저장
    var entryStartTime: [String: Date] = [:]
    var exitStartTime: [String: Date] = [:]
    
    var kalmanRSSI: Double = 0.0
    var kalmanFilter = KalmanFilter()
    var movingAverageRSSI: Double = 0.0
    var rssiValues: [Double] = [] // Moving Average를 위한 배열
    let movingAverageWindow = 5
    
  let entryThreshold: Double = 0.7 // 진입 거리 임계값 (미터)
    let exitThreshold: Double = 2.0  // 이탈 거리 임계값 (미터)

    // 앱 전환을 위한 데이터 배열
    let appData: [(urlScheme: String, packageName: String, major: Int, minor: Int, appName: String)] = [
        ("starbucks://", "com.starbucks.co", 40011, 44551, "Starbucks"),
//        ("costco://", "com.ingka.ikea.app", 40011, 44543, "costco")
        ("cesconf://", "com.cta.cestech", 40011, 44543, "CES2025")
    ]

    override init() {
        super.init()
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.allowsBackgroundLocationUpdates = true
        locationManager?.pausesLocationUpdatesAutomatically = false
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
    }

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
        let rootView = RCTRootView(bridge: bridge!, moduleName: "MyNewProject", initialProperties: nil)

        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = UIViewController()
        window?.rootViewController?.view = rootView
        window?.makeKeyAndVisible()

        let notificationCenter = UNUserNotificationCenter.current()
        notificationCenter.delegate = NotificationManager.shared
        notificationCenter.requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            if granted { NotificationManager.shared.setupNotificationActions() }
        }

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
//            print("[LOG] Live Activity updated to count: \(newCount)")
      }
  }

  

    // MARK: - Beacon Monitoring
    func setupBeaconConstraint() {
        guard let uuid = UUID(uuidString: "74278bda-b644-4520-8f0c-720eaf059935") else { return }
        
        for app in appData {
            let constraint = CLBeaconIdentityConstraint(uuid: uuid, major: CLBeaconMajorValue(app.major), minor: CLBeaconMinorValue(app.minor))
            let beaconRegion = CLBeaconRegion(beaconIdentityConstraint: constraint, identifier: app.appName)
            locationManager?.startMonitoring(for: beaconRegion)
            locationManager?.startRangingBeacons(satisfying: constraint)
        }
    }

  // 앱 정보 캐시
  var activeApp: App? // 현재 활성화된 앱 정보 저장
  var activeAppKey: String? // 현재 활성화된 비콘의 키 저장

  func locationManager(_ manager: CLLocationManager, didRange beacons: [CLBeacon], satisfying constraint: CLBeaconIdentityConstraint) {
      startOrUpdateLiveActivity()
      guard !beacons.isEmpty else {
          print("[LOG] No beacons detected")
          return
      }

      let closestBeacon = beacons.min(by: { $0.accuracy < $1.accuracy })
      guard let beacon = closestBeacon, let appInfo = appData.first(where: { $0.minor == beacon.minor.intValue && $0.major == beacon.major.intValue }) else {
          print("[LOG] No matching app info for detected beacons")
          return
      }

      let key = "\(beacon.major.intValue)-\(beacon.minor.intValue)" // 비콘 고유 키 생성
      let rawRSSI = Double(beacon.rssi)
      guard rawRSSI != 0 else {
          print("[LOG] Invalid RSSI value")
          return
      }

      // 필터링된 RSSI 및 거리 계산
      movingAverageRSSI = calculateMovingAverage(newRSSI: rawRSSI)
      kalmanRSSI = applyKalmanFilter(rssi: rawRSSI)
      let combinedRSSI = (movingAverageRSSI + kalmanRSSI) / 2
      let combinedDistance = calculateDistanceFromRSSI(rssi: combinedRSSI)

      print("""
      [MATCHING APP INFO]
      - App Name: \(appInfo.appName)
      - Minor: \(appInfo.minor)
      - Distance: \(combinedDistance) meters
      """)

      if notificationState[key] == nil {
          notificationState[key] = (hasAppOpened: false, hasNotificationBeenSent: false)
          previousDistance[key] = Double.greatestFiniteMagnitude
      }

      // 진입 조건 처리

      if combinedDistance <= entryThreshold {
          if selectedBeaconKey == nil || selectedBeaconKey == key {
              let now = Date()
              if entryStartTime[key] == nil {
                  entryStartTime[key] = now
              }

              if let startTime = entryStartTime[key], now.timeIntervalSince(startTime) >= 2.0 {
                  selectedBeaconKey = key
                  activeAppKey = key // 활성화된 앱 키 저장
                  // DB 조회는 처음 진입 시 한 번만
                  if let app = DBManager.shared.fetchAppByPackageName(appInfo.packageName) {
                      print("[DEBUG] Fetched App: \(app.name), isAdd: \(app.isAdd), activate: \(app.activate)")
                      
                      // isAdd와 activate가 true일 때만 처리
                      if app.isAdd && app.activate {
                          activeApp = app // 활성화된 앱 정보 저장
                          print("[DEBUG] App is valid for activation: \(app.name)")

                          // 앱 실행 또는 알림 전송
                          if notificationState[key]?.hasAppOpened == false {
                              if UIApplication.shared.applicationState == .active {
                                  openApp(appInfo: appInfo)
                              } else if notificationState[key]?.hasNotificationBeenSent == false {
                                NotificationManager.shared.sendNotificationForAppLaunch(
                                    appName: appInfo.appName,
                                    urlScheme: appInfo.urlScheme,
                                    packageName: appInfo.packageName
                                )
                                  notificationState[key]?.hasNotificationBeenSent = true
                              }
                              notificationState[key]?.hasAppOpened = true
                              print("[LOG] Entered \(appInfo.appName)")
                          }
                      } else {
                          print("[DEBUG] App does not meet activation criteria")
                      }
                  }
                  entryStartTime[key] = nil // 진입 완료 후 초기화
              }
          }
      } else {
          entryStartTime[key] = nil
      }

      // 이탈 조건 처리
      if combinedDistance > exitThreshold && selectedBeaconKey == key {
          let now = Date()
          if exitStartTime[key] == nil {
              exitStartTime[key] = now
          }

          if let startTime = exitStartTime[key], now.timeIntervalSince(startTime) >= 2.0 {
              NotificationManager.shared.sendExitNotification(appName: appInfo.appName)
              resetAppState(forKey: key, appInfo: appInfo)
              selectedBeaconKey = nil
              activeApp = nil // 활성화된 앱 정보 초기화
              activeAppKey = nil
              print("[LOG] Exited \(appInfo.appName)")
              exitStartTime[key] = nil // 이탈 완료 후 초기화
          }
      } else {
          exitStartTime[key] = nil
      }

      previousDistance[key] = combinedDistance
    
  }

  func resetAppState(forKey key: String, appInfo: (urlScheme: String, packageName: String, major: Int, minor: Int, appName: String)) {
      notificationState[key] = (hasAppOpened: false, hasNotificationBeenSent: false)
      print("[LOG] Reset app launch state for \(appInfo.appName)")
      hasAppOpened = false
      hasNotificationBeenSent = false
  }
    // MARK: - Helper Methods
    func calculateDistanceFromRSSI(rssi: Double) -> Double {
        let txPower = -59.0 // TxPower 설정
        return pow(10, (txPower - rssi) / (10 * 2))
    }

    func calculateMovingAverage(newRSSI: Double) -> Double {
        rssiValues.append(newRSSI)
        if rssiValues.count > movingAverageWindow { rssiValues.removeFirst() }
        return rssiValues.reduce(0, +) / Double(rssiValues.count)
    }

    func applyKalmanFilter(rssi: Double) -> Double {
      let processNoise: Double = 1.0
        let measurementNoise: Double = 2.0
        var estimateError: Double = 1.0
        let lastEstimate: Double = kalmanRSSI

        let prediction = lastEstimate
        estimateError += processNoise
        let kalmanGain = estimateError / (estimateError + measurementNoise)
        kalmanRSSI = prediction + kalmanGain * (rssi - prediction)
        return kalmanRSSI
    }

  func openApp(appInfo: (urlScheme: String, packageName: String, major: Int, minor: Int, appName: String)) {
      if let url = URL(string: appInfo.urlScheme), UIApplication.shared.canOpenURL(url) {
          // 앱 실행
          UIApplication.shared.open(url) { success in
              if success {
                  print("[LOG] Opened \(appInfo.appName) app")
                  
                  // UserDefaults에서 memberId 가져오기
                  let memberId = UserDefaults.standard.string(forKey: "memberId") ?? "0"
                  
                  // 서버에 POST 요청
                  ApiService.shared.addCount(packageName: appInfo.packageName, memberId: Int(memberId) ?? 0, type: "LOCATION") { result in
                      switch result {
                      case .success(let response):
                          print("[LOG] Successfully sent count to server: \(response)")
                          print("[LOG] Successfully sent count to server: \(response)")
                      case .failure(let error):
                          print("[LOG] Failed to send count to server: \(error)")
                      }
                  }
              } else {
                  print("[LOG] Failed to open app: \(appInfo.appName)")
              }
          }
      }
  }

//    func resetAppState(forKey key: String, appInfo: (urlScheme: String, packageName: String, major: Int, minor: Int, appName: String)) {
//        notificationState[key] = (hasAppOpened: false, hasNotificationBeenSent: false)
//        print("[LOG] Reset app launch state for \(appInfo.appName)")
//        hasAppOpened = false
//        hasNotificationBeenSent = false
//    }
}
