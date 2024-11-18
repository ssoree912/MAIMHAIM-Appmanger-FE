// MainApplication.java
package com.mynewproject;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.react.PackageList;
import com.mynewproject.pack.LeaveHandlePackage;
import com.mynewproject.pack.MemberIdPackage;
import com.mynewproject.pack.TimeSchedulePackage;

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        public List<ReactPackage> getPackages() {
            List<ReactPackage> packages = new PackageList(this).getPackages();
            packages.add(new MemberIdPackage()); // MemberIdPackage 수동으로 추가
            packages.add(new MyNewProjectPackage());
            packages.add(new TimeSchedulePackage());
            packages.add(new LeaveHandlePackage());
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index"; // JavaScript 진입점
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
    }
}
