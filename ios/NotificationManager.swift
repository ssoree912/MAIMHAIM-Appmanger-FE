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
    func sendNotificationForAppLaunch(appName: String, urlScheme: String) {
        let notification = UNMutableNotificationContent()
        notification.title = "\(appName) Nearby!"
        notification.body = "Would you like to open the \(appName) app?"
        notification.sound = .default
        notification.categoryIdentifier = "BEACON_NOTIFICATION"

        // URL 스킴 저장
        notification.userInfo = ["urlScheme": urlScheme]

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
               let url = URL(string: urlScheme), UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                print("[LOG] Opened app via URL scheme: \(urlScheme)")
            } else {
                print("[LOG] Unable to open app via URL scheme")
            }
        }
        completionHandler()
    }
}
