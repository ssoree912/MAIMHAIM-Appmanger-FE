import UserNotifications
import UIKit

class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()

    private override init() {
        super.init()
    }

    func setupNotificationActions() {
        let openAction = UNNotificationAction(
            identifier: "OPEN_APP_ACTION",
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

    // 동적으로 앱 문구와 URL 스킴 설정
    func sendNotificationForAppLaunch(appName: String, urlScheme: String, packageName: String) {
        let notification = UNMutableNotificationContent()
        notification.title = "\(appName) Nearby!"
        notification.body = "Would you like to open the \(appName) app?"
        notification.sound = .default
        notification.categoryIdentifier = "BEACON_NOTIFICATION"

        // URL 스킴과 패키지 이름 저장
        notification.userInfo = ["urlScheme": urlScheme, "packageName": packageName]

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[LOG] Error sending notification for \(appName): \(error)")
            } else {
                print("[LOG] Notification sent successfully for \(appName)")
            }
        }
    }

    func sendExitNotification(appName: String) {
        let notification = UNMutableNotificationContent()
        notification.title = "You left \(appName)!"
        notification.body = "You are now far from the beacon."
        notification.sound = .default

        let request = UNNotificationRequest(identifier: UUID().uuidString, content: notification, trigger: nil)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[LOG] Error sending exit notification for \(appName): \(error)")
            } else {
                print("[LOG] Exit notification sent successfully for \(appName)")
            }
        }
    }

    // MARK: - UNUserNotificationCenterDelegate
  func userNotificationCenter(
      _ center: UNUserNotificationCenter,
      didReceive response: UNNotificationResponse,
      withCompletionHandler completionHandler: @escaping () -> Void
  ) {
      if response.actionIdentifier == "OPEN_APP_ACTION" {
          if let urlScheme = response.notification.request.content.userInfo["urlScheme"] as? String,
             let packageName = response.notification.request.content.userInfo["packageName"] as? String,
             let url = URL(string: urlScheme), UIApplication.shared.canOpenURL(url) {
              
              // 앱 열기
              UIApplication.shared.open(url, options: [:]) { success in
                  if success {
                      print("[LOG] Opened app via URL scheme: \(urlScheme)")
                      
                      // UserDefaults에서 memberId 가져오기
                      let memberId = UserDefaults.standard.string(forKey: "memberId") ?? "0"
                      
                      // 서버에 POST 요청
                      ApiService.shared.addCount(packageName: packageName, memberId: Int(memberId) ?? 0, type: "LOCATION") { result in
                          switch result {
                          case .success(let response):
                              print("[LOG] Successfully sent count to server: \(response)")
                          case .failure(let error):
                              print("[LOG] Failed to send count to server: \(error)")
                          }
                      }
                  } else {
                      print("[LOG] Unable to open app via URL scheme")
                  }
              }
          } else {
              print("[LOG] Unable to open app via URL scheme")
          }
      }
      completionHandler()
  }
}
