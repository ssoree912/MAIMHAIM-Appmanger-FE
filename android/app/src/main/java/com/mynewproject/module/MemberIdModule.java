package com.mynewproject.module;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.mynewproject.AppInfoFetcher;
import com.mynewproject.db.AppDB;

public class MemberIdModule extends ReactContextBaseJavaModule {
    private static final String TAG = "MemberIdModule"; // 로그 태그 설정
    private static final String PREFS_NAME = "MyAppPrefs";
    private static final String MEMBER_ID_KEY = "memberId";

    private final SharedPreferences sharedPreferences;
    private AppDB appDB;
    public MemberIdModule(ReactApplicationContext reactContext) {
        super(reactContext);
        sharedPreferences = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        Log.d(TAG, "MemberIdModule 생성됨"); // 모듈 생성 시 로그 출력
        this.appDB = AppDB.getInstance(reactContext); // Room DB 인스턴스 가져오기
    }

    @NonNull
    @Override
    public String getName() {
        return "MemberIdModule";
    }

    @ReactMethod
    public void saveMemberId(String memberId, Promise promise) {
        Log.d(TAG, "saveMemberId 호출됨 - memberId: " + memberId); // 메서드 호출 시 로그 출력
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(MEMBER_ID_KEY, memberId);
        boolean success = editor.commit();
        if (success) {
            promise.resolve("MemberId 저장 성공");
            AppInfoFetcher appInfoFetcher = new AppInfoFetcher(getReactApplicationContext(),appDB);
            appInfoFetcher.getAllInstalledUserAppInfo();
        } else {
            promise.reject("ERROR", "MemberId 저장 실패");
        }
    }

    @ReactMethod
    public void getMemberId(Promise promise) {
        Log.d(TAG, "getMemberId 호출됨"); // 메서드 호출 시 로그 출력
        String memberId = sharedPreferences.getString(MEMBER_ID_KEY, null);
        if (memberId != null) {
            promise.resolve(memberId);
        } else {
            promise.reject("ERROR", "MemberId가 없습니다");
        }
    }
}