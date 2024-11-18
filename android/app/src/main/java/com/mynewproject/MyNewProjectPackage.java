// MyNewProjectPackage.java
package com.mynewproject;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.mynewproject.module.ActivateModule;
import com.mynewproject.module.ForegroundServiceModule;
import com.mynewproject.module.LeaveHandleModule;
import com.mynewproject.module.MyNewProjectModule;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MyNewProjectPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new MyNewProjectModule(reactContext)); // ReactApplicationContext 전달
        modules.add(new ForegroundServiceModule(reactContext)); // ForegroundServiceModule을 등록
//        modules.add(new LeaveHandleModule(reactContext));
        modules.add(new ActivateModule(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList(); // ViewManager가 없는 경우 빈 리스트 반환
    }
}
