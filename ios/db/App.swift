import Foundation

enum TriggerType: String {
    case location = "LOCATION"
    case time = "TIME"
    case schedule = "SCHEDULE"
    case motion = "MOTION"
}

@objcMembers
class App: NSObject {
  var appId: Int
  var name: String
  var apName: String
  var packageName: String
  var isAdd: Bool
  var activate: Bool
  var triggerType: String
  var triggerActive: Bool
  var timeTriggerActive: Bool
  var motionTriggerActive: Bool
  var advancedMode: Bool
  var isForeground: Bool
  var time: String
  var week: String
  var count: Int
  

  init(appId: Int, name: String, apName: String, packageName: String, isAdd: Bool, activate: Bool, triggerType: String, triggerActive: Bool, timeTriggerActive: Bool, motionTriggerActive: Bool, advancedMode: Bool, isForeground: Bool, time: String, week: String, count: Int) {
    self.appId = appId
    self.name = name
    self.apName = apName
    self.packageName = packageName
    self.isAdd = isAdd
    self.activate = activate
    self.triggerType = triggerType
    self.triggerActive = triggerActive
    self.timeTriggerActive = timeTriggerActive
    self.motionTriggerActive = motionTriggerActive
    self.advancedMode = advancedMode
    self.isForeground = isForeground
    self.time = time
    self.week = week
    self.count = count
  }
}
