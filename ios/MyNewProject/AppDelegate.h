#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import <UserNotifications/UserNotifications.h>

@interface AppDelegate : RCTAppDelegate <CLLocationManagerDelegate, UNUserNotificationCenterDelegate>

@property (nonatomic, strong) CLLocationManager *locationManager;
@property (nonatomic, strong) CLBeaconIdentityConstraint *beaconConstraint; // 선언된 속성
@property (nonatomic, assign) CLProximity previousProximity;

@end
