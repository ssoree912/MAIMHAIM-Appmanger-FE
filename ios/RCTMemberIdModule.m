#import "RCTMemberIdModule.h"
#import "MyNewProject-Swift.h"
#import "Constants.h"

@implementation RCTMemberIdModule

RCT_EXPORT_MODULE();

// memberId를 저장 및 로직 실행
RCT_EXPORT_METHOD(saveMemberId:(NSString *)memberId)
{
  NSLog(@">>>>>>>Received ios memberId: %@", memberId);

  // UserDefaults에 저장
  [[NSUserDefaults standardUserDefaults] setObject:memberId forKey:@"memberId"];
  [[NSUserDefaults standardUserDefaults] synchronize];

  // 특정 URL 스키마 확인 및 요청 실행
  NSString *urlScheme = @"starbucks://";
  if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:urlScheme]]) {
    NSLog(@"Starbucks app is installed. Sending request...");
    
    // 서버로 데이터 전송
    [self sendDataToServerWithMemberId:memberId];
  } else {
    NSLog(@"Starbucks app is not installed.");
  }

  // SQLite에 앱 데이터 추가
  [self addAppToDatabase];
}

// 서버로 데이터 POST 전송
- (void)sendDataToServerWithMemberId:(NSString *)memberId {
  NSString *urlString = [NSString stringWithFormat:@"%@/api/v2/managed-apps", BASE_URL];
    NSURL *url = [NSURL URLWithString:urlString];
  NSDictionary *body = @{
    @"memberId": memberId,
    @"apps": @[
        @{
          @"packageName": @"com.starbucks.co",
          @"uid": @"1",
          @"appName": @"Starbucks"
        }
    ]
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
        NSDictionary *responseObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
        NSLog(@"Response: %@", responseObject);
      }
    }
  }];

  [task resume];
}

// SQLite에 앱 데이터 추가
- (void)addAppToDatabase {
    NSString *packageName = @"com.starbucks.co";
    
    // Swift DBManager를 호출하여 packageName이 존재하는지 확인
    App *existingApp = [DBManager.shared fetchAppByPackageName:packageName];
    
    if (existingApp) {
        NSLog(@"App with packageName %@ already exists in database.", packageName);
    } else {
        // 존재하지 않으면 새로 추가
        App *app = [[App alloc] initWithAppId:1
                                         name:@"Starbucks"
                                       apName:@"starbucks"
                                 packageName:packageName
                                       isAdd:YES
                                   activate:YES
                                 triggerType:@"LOCATION"
                               triggerActive:YES
                           timeTriggerActive:NO
                         motionTriggerActive:NO
                                 advancedMode:NO
                                  isForeground:NO
                                         time:@"@00:00:00"
                                          week:@"FFFFFFF"
                                        count:0];
        [DBManager.shared insertAppWithApp:app];
        NSLog(@"App data added to database.");
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
