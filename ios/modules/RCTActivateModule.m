//
//  RCTActivateModule.m
//  MyNewProject
//
//  Created by 황솔희 on 12/19/24.
//

#import <Foundation/Foundation.h>
#import "MyNewProject-Swift.h"
#import "RCTActivateModule.h"
@implementation RCTActivateModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(updateActivateValue:(NSString *)packageName isActive:(BOOL)isActive resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  BOOL success = [DBManager.shared updateAppActivateWithPackageName:packageName isActive:isActive];
  if (success) {
    resolve(@{@"activate success": @YES});
  } else {
    reject(@"update_failed", @"Failed to update activate value", nil);
  }
}
@end
