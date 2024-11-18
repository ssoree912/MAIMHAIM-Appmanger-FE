package com.mynewproject;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import java.util.ArrayList;
import java.util.List;

public class PackageList {
    private final MainApplication app;

    public PackageList(MainApplication app) {
        this.app = app;
    }

    public List<ReactPackage> getPackages() {
        return new ArrayList<ReactPackage>() {{
            add(new MainReactPackage());
            // 필요한 다른 패키지를 추가합니다.
        }};
    }
}
