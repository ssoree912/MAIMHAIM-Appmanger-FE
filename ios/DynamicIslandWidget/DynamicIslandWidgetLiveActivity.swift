//
//  DynamicIslandWidgetLiveActivity.swift
//  DynamicIslandWidget
//

import ActivityKit
import WidgetKit
import SwiftUI

struct DynamicIslandWidgetAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var count: Int // 상태: 카운트 값
    }

    var name: String // 고정 속성: 이름
}

struct DynamicIslandWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DynamicIslandWidgetAttributes.self) { context in
            // 잠금 화면 및 기본 UI
            VStack {
                Text("Beacon Tracker")
                    .font(.headline)
                Text("Count: \(context.state.count)") // 카운트 값 표시
                    .font(.largeTitle)
                    .foregroundColor(.blue)
            }
            .activityBackgroundTint(Color.gray)
            .activitySystemActionForegroundColor(Color.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Count")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.count)")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Dynamic Count: \(context.state.count)")
                }
            } compactLeading: {
                Text("🔢")
            } compactTrailing: {
                Text("\(context.state.count)")
            } minimal: {
                Text("\(context.state.count)")
            }
        }
      
    }
}

// Preview 및 테스트
extension DynamicIslandWidgetAttributes {
    fileprivate static var preview: DynamicIslandWidgetAttributes {
        DynamicIslandWidgetAttributes(name: "Beacon Counter")
    }
}

extension DynamicIslandWidgetAttributes.ContentState {
    fileprivate static var example: DynamicIslandWidgetAttributes.ContentState {
        DynamicIslandWidgetAttributes.ContentState(count: 1)
    }
}

#Preview("Notification", as: .content, using: DynamicIslandWidgetAttributes.preview) {
    DynamicIslandWidgetLiveActivity()
} contentStates: {
    DynamicIslandWidgetAttributes.ContentState.example
}
