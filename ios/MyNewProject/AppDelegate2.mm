//#import "AppDelegate.h"
//#import <React/RCTBundleURLProvider.h>
//#import "MyNewProject-Swift.h" // Swift 파일 사용을 위한 자동 생성 헤더
//#import <React/RCTRootView.h>
//
//@implementation AppDelegate
//
//- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
//{
//    // UIWindow 초기화 및 Swift ViewController 설정
//    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
//    ViewController *rootViewController = [[ViewController alloc] init]; // Swift ViewController 생성
//    self.window.rootViewController = rootViewController; // 루트 뷰 컨트롤러로 설정
//    [self.window makeKeyAndVisible];
//
//    // 알림 권한 요청
//    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
//    center.delegate = self;
//    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert + UNAuthorizationOptionSound + UNAuthorizationOptionBadge)
//                          completionHandler:^(BOOL granted, NSError * _Nullable error) {
//        if (error) {
//            NSLog(@"Notification Authorization Error: %@", error.localizedDescription);
//        }
//    }];
//
//    return YES;
//}
//
//- (void)initializeBeaconMonitoring {
//    self.locationManager = [[CLLocationManager alloc] init];
//    self.locationManager.delegate = self;
//    self.locationManager.allowsBackgroundLocationUpdates = true; // 백그라운드 업데이트 허용
//    self.locationManager.pausesLocationUpdatesAutomatically = false; // 자동 중단 비활성화
//    [self.locationManager requestAlwaysAuthorization];
//
//    // Beacon Region 설정
//    NSUUID *beaconUUID = [[NSUUID alloc] initWithUUIDString:@"74278bda-b644-4520-8f0c-720eaf059935"];
//    self.beaconConstraint = [[CLBeaconIdentityConstraint alloc] initWithUUID:beaconUUID major:40011 minor:44551];
//    CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithUUID:beaconUUID identifier:@"com.example.mybeaconregion"];
//
//    // 모니터링 및 탐지 시작
//    [self.locationManager startMonitoringForRegion:beaconRegion];
//    [self.locationManager startRangingBeaconsSatisfyingConstraint:self.beaconConstraint];
//}
//
//- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
//{
//#if DEBUG
//    return [NSURL URLWithString:@"http://192.168.219.101:8081/index.bundle?platform=ios&dev=true"];
//#else
//    return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
//#endif
//}
//
//- (void)locationManager:(CLLocationManager *)manager didRangeBeacons:(NSArray<CLBeacon *> *)beacons satisfyingConstraint:(CLBeaconIdentityConstraint *)constraint {
//    if (beacons.count == 0) {
//        NSLog(@"No beacons detected");
//        return;
//    }
//
//    CLBeacon *nearestBeacon = beacons.firstObject;
//    NSNumber *targetMinor = @44551;
//
//    if ([nearestBeacon.minor isEqualToNumber:targetMinor]) {
//        if (nearestBeacon.proximity == CLProximityImmediate || nearestBeacon.proximity == CLProximityNear) {
//            if (self.previousProximity != CLProximityImmediate && self.previousProximity != CLProximityNear) {
//                [self sendNotificationWithTitle:@"Starbucks Nearby!"
//                                           body:@"Would you like to open the Starbucks app?"
//                               actionIdentifier:@"OPEN_STARBUCKS_APP"];
//                NSLog(@"Entered Starbucks beacon region");
//            }
//        } else if (nearestBeacon.proximity == CLProximityFar) {
//            if (self.previousProximity != CLProximityFar) {
//                [self sendNotificationWithTitle:@"You left Starbucks!"
//                                           body:@"You are now far from the beacon."
//                               actionIdentifier:nil];
//                NSLog(@"Exited Starbucks beacon region");
//            }
//        }
//        self.previousProximity = nearestBeacon.proximity;
//    }
//}
//
//- (void)sendNotificationWithTitle:(NSString *)title body:(NSString *)body actionIdentifier:(NSString *)actionIdentifier {
//    UNMutableNotificationContent *content = [[UNMutableNotificationContent alloc] init];
//    content.title = title;
//    content.body = body;
//    content.sound = [UNNotificationSound defaultSound];
//    content.categoryIdentifier = @"BEACON_NOTIFICATION";
//
//    if (actionIdentifier) {
//        UNNotificationAction *openAppAction = [UNNotificationAction actionWithIdentifier:actionIdentifier
//                                                                                   title:@"Open Starbucks"
//                                                                                 options:UNNotificationActionOptionForeground];
//        UNNotificationCategory *category = [UNNotificationCategory categoryWithIdentifier:@"BEACON_NOTIFICATION"
//                                                                                  actions:@[openAppAction]
//                                                                        intentIdentifiers:@[]
//                                                                                  options:UNNotificationCategoryOptionNone];
//        [[UNUserNotificationCenter currentNotificationCenter] setNotificationCategories:[NSSet setWithObject:category]];
//    }
//
//    UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:[[NSUUID UUID] UUIDString] content:content trigger:nil];
//    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
//        if (error) {
//            NSLog(@"Failed to add notification: %@", error.localizedDescription);
//        }
//    }];
//}
//
//- (void)userNotificationCenter:(UNUserNotificationCenter *)center
//       didReceiveNotificationResponse:(UNNotificationResponse *)response
//                withCompletionHandler:(void (^)(void))completionHandler {
//    if ([response.actionIdentifier isEqualToString:@"OPEN_STARBUCKS_APP"]) {
//        NSURL *url = [NSURL URLWithString:@"starbucks://"];
//        if ([[UIApplication sharedApplication] canOpenURL:url]) {
//            [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
//        }
//    }
//    completionHandler();
//}
//- (void)applicationDidEnterBackground:(UIApplication *)application {
//    UIBackgroundTaskIdentifier bgTask = [[UIApplication sharedApplication] beginBackgroundTaskWithName:@"BeaconTask" expirationHandler:^{
//        // 작업이 종료될 때 호출
//        [[UIApplication sharedApplication] endBackgroundTask:bgTask];
//    }];
//
//    // 백그라운드에서 비콘 스캔 작업 유지
//    [self.locationManager startRangingBeaconsSatisfyingConstraint:self.beaconConstraint];
//}
//@end
