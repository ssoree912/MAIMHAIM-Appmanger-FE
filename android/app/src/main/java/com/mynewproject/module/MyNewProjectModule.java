// MyNewProjectModule.java
package com.mynewproject.module;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mynewproject.MainActivity;

public class MyNewProjectModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public MyNewProjectModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "MyNewProjectModule";
    }

    @ReactMethod
    public void sendMemberId(int memberId) {
        Intent intent = new Intent(reactContext, MainActivity.class);
        intent.putExtra("memberId", memberId);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }
}
