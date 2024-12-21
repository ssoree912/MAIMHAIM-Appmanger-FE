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
//    [self addAppToDatabase];
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

RCT_EXPORT_METHOD(updateAddAppValue:(NSString *)packageName isAdd:(BOOL)isAdd resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  BOOL success = [DBManager.shared updateAppAddWithPackageName:packageName isAdd:isAdd];
  NSLog(@">>>>>>> is success: %@", packageName);
  if (success) {
    resolve(@{@"success": @YES});
  } else {
    reject(@"update_failed", @"Failed to update add value", nil);
  }
}


// 서버로 데이터 POST 전송
- (void)sendDataToServerWithMemberId:(NSString *)memberId {
    NSString *urlString = [NSString stringWithFormat:@"%@/api/v2/managed-apps", BASE_URL];
    NSURL *url = [NSURL URLWithString:urlString];

    NSMutableArray *appsArray = [NSMutableArray array];
    for (NSDictionary *appData in appsData) {
        NSString *urlScheme = [NSString stringWithFormat:@"%@://", appData[@"urlScheme"]];
        if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:urlScheme]]) {
            [appsArray addObject:@{
                @"packageName": appData[@"packageName"],
                @"uid": appData[@"uid"],
                @"appName": appData[@"name"]
            }];
        } else {
            NSLog(@"App %@ with URL scheme %@ is not installed.", appData[@"name"], urlScheme);
        }
    }

    if (appsArray.count == 0) {
        NSLog(@"No apps with valid URL schemes are installed. No request will be sent.");
        return;
    }

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

    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setHTTPBody:jsonData];

    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (error) {
            NSLog(@"Failed to send request: %@", error);
        } else {
            NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
            NSLog(@"Response Code: %ld", (long)[httpResponse statusCode]);
            if (data) {
                [self processResponseData:data];
            }
        }
    }];

    [task resume];
}
- (void)processResponseData:(NSData *)data {
    NSError *error;
    NSDictionary *responseObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];

    if (error) {
        NSLog(@"Failed to parse JSON: %@", error);
        return;
    }

    NSLog(@"Response Object: %@", responseObject);

    NSArray *dataList = responseObject[@"data"];
    if (![dataList isKindOfClass:[NSArray class]] || dataList.count == 0) {
        NSLog(@"No valid data found in response.");
        return;
    }

    for (NSDictionary *appData in dataList) {
        NSString *packageName = appData[@"packageName"];
        if (!packageName || ![packageName isKindOfClass:[NSString class]]) {
            NSLog(@"Invalid packageName in appData: %@", appData);
            continue;
        }

        App *app = [[App alloc] initWithAppId:[appData[@"appId"] intValue]
                                         name:appData[@"name"]
                                       apName:appData[@"name"] // Assuming `apName` is the same as `name` from response
                                 packageName:packageName
                                        isAdd:NO
                                    activate:YES
                                  triggerType:@"LOCATION"
                                triggerActive:YES
                            timeTriggerActive:NO
                          motionTriggerActive:NO
                                  advancedMode:NO
                                   isForeground:NO
                                          time:@"00:00:00"
                                           week:@"FFFFFFF"
                                        count:0]; // Default value

        // Insert into database
        [DBManager.shared insertAppWithApp:app];
        NSLog(@"App data added to database for packageName %@", packageName);
    }
}
@end
