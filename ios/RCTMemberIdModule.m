#import "RCTMemberIdModule.h"
#import "MyNewProject-Swift.h"
#import "Constants.h"

@implementation RCTMemberIdModule

RCT_EXPORT_MODULE();

// 앱 데이터 배열
NSArray *appsData;

+ (void)initialize {
    appsData = @[
        @{@"packageName": @"com.starbucks.co", @"apName": @"Starbucks", @"name": @"Starbucks", @"uid": @"1", @"urlScheme": @"starbucks"},
        @{@"packageName": @"com.costco.dmc.store", @"apName": @"Costco", @"name": @"Costco", @"uid": @"2", @"urlScheme": @"costco"},
        @{@"packageName": @"com.fidelity.wi.activity", @"apName": @"Fidelity", @"name": @"Fidelity", @"uid": @"3", @"urlScheme": @"netbenefits"},
        @{@"packageName": @"com.amazon.mShop.android.shopping", @"apName": @"Amazon", @"name": @"Amazon", @"uid": @"4", @"urlScheme": @"amazonpay"},
        @{@"packageName": @"com.lasoo.android.target", @"apName": @"Target", @"name": @"Target", @"uid": @"5", @"urlScheme": @"targetaustralia"},
        @{@"packageName": @"com.cta.cestech", @"apName": @"CESConf", @"name": @"CESConf", @"uid": @"6", @"urlScheme": @"cesconf"},
    ];
}

// memberId를 저장 및 로직 실행
RCT_EXPORT_METHOD(saveMemberId:(NSString *)memberId)
{
    NSLog(@">>>>>>>Received ios memberId: %@", memberId);

    // UserDefaults에 저장
    [[NSUserDefaults standardUserDefaults] setObject:memberId forKey:@"memberId"];
    [[NSUserDefaults standardUserDefaults] synchronize];

    // 앱 데이터 확인 및 서버로 요청
    [self sendDataToServerWithMemberId:memberId];
    [self addAppToDatabase];
}
RCT_EXPORT_METHOD(updateActivateValue:(NSString *)packageName isActive:(BOOL)isActive resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  BOOL success = [DBManager.shared updateAppActivateWithPackageName:packageName isActive:isActive];
  if (success) {
    resolve(@{@"success": @YES});
  } else {
    reject(@"update_failed", @"Failed to update activate value", nil);
  }
}



// 서버로 데이터 POST 전송
- (void)sendDataToServerWithMemberId:(NSString *)memberId {
    NSString *urlString = [NSString stringWithFormat:@"%@/api/v2/managed-apps", BASE_URL];
    NSURL *url = [NSURL URLWithString:urlString];

    // 동적으로 apps 배열 생성
    NSMutableArray *appsArray = [NSMutableArray array];
    for (NSDictionary *appData in appsData) {
        // URL 스킴 확인
        NSString *urlScheme = [NSString stringWithFormat:@"%@://", appData[@"urlScheme"]];
        if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:urlScheme]]) {
            // 설치된 앱만 appsArray에 추가
            [appsArray addObject:@{
                @"packageName": appData[@"packageName"],
                @"uid": appData[@"uid"],
                @"appName": appData[@"name"]
            }];
        } else {
            NSLog(@"App %@ with URL scheme %@ is not installed.", appData[@"name"], urlScheme);
        }
    }

    // appsArray가 비어 있는 경우 요청하지 않음
    if (appsArray.count == 0) {
        NSLog(@"No apps with valid URL schemes are installed. No request will be sent.");
        return;
    }

    // 요청 body 구성
    NSDictionary *body = @{
        @"memberId": memberId,
        @"apps": appsArray
    };

    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:body options:0 error:&error];

    if (!jsonData) {
        NSLog(@"Failed to serialize JSON: %@", error);
        return;
    }

    // HTTP 요청 설정
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPBody:jsonData];

    // HTTP 요청 전송
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            NSLog(@"Failed to send request: %@", error);
        } else {
            NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
            NSLog(@"Response Code: %ld", (long)[httpResponse statusCode]);
            if (data) {
                NSDictionary *responseObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
                NSLog(@"Response: %@", responseObject);
            }
        }
    }];

    [task resume];
}

// SQLite에 앱 데이터 추가
- (void)addAppToDatabase {
    for (NSDictionary *appData in appsData) {
        NSString *packageName = appData[@"packageName"];
        
        // Swift DBManager를 호출하여 packageName이 존재하는지 확인
        App *existingApp = [DBManager.shared fetchAppByPackageName:packageName];
        
        if (existingApp) {
            NSLog(@"App with packageName %@ already exists in database.", packageName);
        } else {
            // 존재하지 않으면 새로 추가
            App *app = [[App alloc] initWithAppId:[appData[@"uid"] intValue]
                                             name:appData[@"name"]
                                           apName:appData[@"apName"]
                                     packageName:packageName
                                           isAdd:YES
                                       activate:YES
                                     triggerType:@"LOCATION"
                                   triggerActive:YES
                               timeTriggerActive:NO
                             motionTriggerActive:NO
                                     advancedMode:NO
                                      isForeground:NO
                                             time:@"00:00:00"
                                              week:@"FFFFFFF"
                                            count:0];
            [DBManager.shared insertAppWithApp:app];
            NSLog(@"App data added to database for packageName %@", packageName);
        }
    }

    // 저장된 데이터베이스 전체 데이터 로그 출력
    NSArray *allApps = [DBManager.shared fetchAllApps];
    NSLog(@"--- All Apps in Database ---");
    for (App *app in allApps) {
        NSLog(@"AppId: %ld, Name: %@, apName: %@, PackageName: %@, isAdd: %d, Activate: %d, TriggerType: %@, TriggerActive: %d, TimeTriggerActive: %d, MotionTriggerActive: %d, AdvancedMode: %d, IsForeground: %d",
              (long)app.appId,
              app.name,
              app.apName,
              app.packageName,
              app.isAdd,
              app.activate,
              app.triggerType,
              app.triggerActive,
              app.timeTriggerActive,
              app.motionTriggerActive,
              app.advancedMode,
              app.isForeground);
    }
    NSLog(@"--- End of All Apps ---");
}

@end
