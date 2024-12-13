//
//  DynamicIslandWidgetBundle.swift
//  DynamicIslandWidget
//
//  Created by 황솔희 on 12/13/24.
//

import WidgetKit
import SwiftUI

@main
struct DynamicIslandWidgetBundle: WidgetBundle {
    var body: some Widget {
        DynamicIslandWidget()
        DynamicIslandWidgetControl()
        DynamicIslandWidgetLiveActivity()
    }
}
