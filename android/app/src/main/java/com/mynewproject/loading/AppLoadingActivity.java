package com.mynewproject.loading;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.view.animation.AlphaAnimation;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;

import com.mynewproject.R;

public class AppLoadingActivity extends Activity {

    private String packageName;         // 호출된 패키지 이름
    private String displayAppName = ""; // 표시할 앱 이름(4개 앱이 아니면 ""로 둠)
    private int displayAppIconRes = 0;  // 표시할 앱 아이콘 리소스(4개 앱이 아니면 0)

    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // (1) 인텐트에서 packageName 추출
        Intent intent = getIntent();
        if (intent != null) {
            packageName = intent.getStringExtra("EXTRA_PACKAGE_NAME");
        }

        // (2) packageName에 따라 앱 이름/아이콘 설정
        setupAppInfo(packageName);

        // (3) 메인 ConstraintLayout 생성
        ConstraintLayout mainLayout = new ConstraintLayout(this);
        mainLayout.setId(View.generateViewId());
        mainLayout.setBackgroundColor(Color.WHITE);
        setContentView(mainLayout);

        // -----------------------------
        // (A) 원형 로딩 뷰
        // -----------------------------
        View loadingCircle = new View(this);
        loadingCircle.setId(View.generateViewId());
        ConstraintLayout.LayoutParams circleParams = new ConstraintLayout.LayoutParams(
                300, // 원하는 크기로 조절
                300
        );
        loadingCircle.setLayoutParams(circleParams);

        GradientDrawable circleDrawable = new GradientDrawable();
        circleDrawable.setShape(GradientDrawable.OVAL);
        circleDrawable.setStroke(12, Color.parseColor("#48CBC0"));
        loadingCircle.setBackground(circleDrawable);

        // 로딩 애니메이션
        AlphaAnimation fadeAnimation = new AlphaAnimation(0.3f, 1.0f);
        fadeAnimation.setDuration(1000);
        fadeAnimation.setRepeatMode(AlphaAnimation.REVERSE);
        fadeAnimation.setRepeatCount(AlphaAnimation.INFINITE);
        loadingCircle.startAnimation(fadeAnimation);

        mainLayout.addView(loadingCircle);

        // -----------------------------
        // (B) 원 내부에 항상 MaimHaim 로고
        // -----------------------------
        ImageView maimhaimLogo = new ImageView(this);
        maimhaimLogo.setId(View.generateViewId());
        // 프로젝트 내 "MaimHaim" 로고 Drawable 리소스 (예: R.drawable.maimhaim_logo)
        maimhaimLogo.setImageResource(R.drawable.app_logo);

        ConstraintLayout.LayoutParams maimhaimLogoParams = new ConstraintLayout.LayoutParams(
                200,200 // 원하는 크기로 조절
        );
        maimhaimLogo.setLayoutParams(maimhaimLogoParams);
        mainLayout.addView(maimhaimLogo);

        // -----------------------------
        // (C) 로딩 텍스트
        // -----------------------------
        TextView loadingText = new TextView(this);
        loadingText.setId(View.generateViewId());

        // 앱 이름이 있으면 "Loading Starbucks...", 아니면 "Loading..."
        loadingText.setText("Just a few more seconds!");


        loadingText.setTextSize(20);
        loadingText.setTextColor(Color.parseColor("#9496A1"));
        loadingText.setGravity(View.TEXT_ALIGNMENT_CENTER);
        mainLayout.addView(loadingText);

        // -----------------------------
        // (D) 추가 텍스트
        // -----------------------------
        TextView additionalText = new TextView(this);
        additionalText.setId(View.generateViewId());
        additionalText.setText("Please wait a moment.");
        if (!displayAppName.isEmpty()) {
            additionalText.setText("Getting your " + displayAppName + " app ready...");
        } else {
            additionalText.setText("...");
        }
        additionalText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        additionalText.setTextColor(Color.BLACK);
        additionalText.setGravity(View.TEXT_ALIGNMENT_CENTER);
        mainLayout.addView(additionalText);

        // -----------------------------
        // (E) 앱 아이콘 (4개 앱만 표시)
        // -----------------------------
        ImageView appIcon = new ImageView(this);
        appIcon.setId(View.generateViewId());
        // 만약 displayAppIconRes == 0이면(4개 앱이 아님) 표시 안 함
        if (displayAppIconRes != 0) {
            appIcon.setImageResource(displayAppIconRes);
        } else {
            appIcon.setVisibility(View.GONE);
        }

        ConstraintLayout.LayoutParams appIconParams = new ConstraintLayout.LayoutParams(
                130,130 // 원하는 크기로 조절
        );
        appIcon.setLayoutParams(appIconParams);
        mainLayout.addView(appIcon);

        // -----------------------------
        // (F) 하단 제작자 텍스트 이미지(MaimHaim)
        // -----------------------------
        ImageView maimhaimText = new ImageView(this);
        maimhaimText.setId(View.generateViewId());
        // 프로젝트 내 "MaimHaim" 로고 Drawable 리소스 (예: R.drawable.maimhaim_logo)
        maimhaimText.setImageResource(R.drawable.maimhaimtext);
        ConstraintLayout.LayoutParams maimhaimTextParams = new ConstraintLayout.LayoutParams(
                200,200 // 원하는 크기로 조절
        );
        maimhaimText.setLayoutParams(maimhaimTextParams);
        mainLayout.addView(maimhaimText);


        // -----------------------------
        // (G) ConstraintSet 배치
        // -----------------------------
        ConstraintSet constraintSet = new ConstraintSet();
        constraintSet.clone(mainLayout);

        int parentId = mainLayout.getId();
        int circleId = loadingCircle.getId();
        int maimhaimLogoId = maimhaimLogo.getId();
        int loadingTextId = loadingText.getId();
        int additionalTextId = additionalText.getId();
        int appIconId = appIcon.getId();
        int maimhaimTextId = maimhaimText.getId();

        // 1) 원(circle) 중앙보다 약간 위
        constraintSet.connect(circleId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(circleId, ConstraintSet.END, parentId, ConstraintSet.END, 0);
        constraintSet.connect(circleId, ConstraintSet.TOP, parentId, ConstraintSet.TOP, 0);
        constraintSet.connect(circleId, ConstraintSet.BOTTOM, parentId, ConstraintSet.BOTTOM, 0);
        constraintSet.setHorizontalBias(circleId, 0.5f);
        constraintSet.setVerticalBias(circleId, 0.4f);

        // 2) 원 내부 MaimHaim 로고
        constraintSet.connect(maimhaimLogoId, ConstraintSet.START, circleId, ConstraintSet.START, 0);
        constraintSet.connect(maimhaimLogoId, ConstraintSet.END, circleId, ConstraintSet.END, 0);
        constraintSet.connect(maimhaimLogoId, ConstraintSet.TOP, circleId, ConstraintSet.TOP, 0);
        constraintSet.connect(maimhaimLogoId, ConstraintSet.BOTTOM, circleId, ConstraintSet.BOTTOM, 0);

        // 3) 로딩 텍스트 - 원 아래
        constraintSet.connect(loadingTextId, ConstraintSet.TOP, circleId, ConstraintSet.BOTTOM, 40);
        constraintSet.connect(loadingTextId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(loadingTextId, ConstraintSet.END, parentId, ConstraintSet.END, 0);

        // 4) 추가 텍스트 - 로딩 텍스트 아래
        constraintSet.connect(additionalTextId, ConstraintSet.TOP, loadingTextId, ConstraintSet.BOTTOM, 10);
        constraintSet.connect(additionalTextId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(additionalTextId, ConstraintSet.END, parentId, ConstraintSet.END, 0);

        // 5) 앱 아이콘 - 추가 텍스트 아래
        constraintSet.connect(appIconId, ConstraintSet.TOP, additionalTextId, ConstraintSet.BOTTOM, 30);
        constraintSet.connect(appIconId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(appIconId, ConstraintSet.END, parentId, ConstraintSet.END, 0);

        // 6) 제작자 텍스트 - 화면 하단
        constraintSet.connect(maimhaimTextId, ConstraintSet.BOTTOM, parentId, ConstraintSet.BOTTOM, 50);
        constraintSet.connect(maimhaimTextId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(maimhaimTextId, ConstraintSet.END, parentId, ConstraintSet.END, 0);

        constraintSet.applyTo(mainLayout);

        // -----------------------------
        // (H) 일정 시간 후 실제 앱 실행
        // -----------------------------
        new Handler().postDelayed(() -> {
            openRealApp(packageName);
        }, 2000);  // 2초(원하는 시간으로 조절)
    }

    /**
     * 4개 패키지면 앱 이름, 앱 아이콘 설정
     * 그 외 패키지는 displayAppName = "" , displayAppIconRes = 0
     */
    private void setupAppInfo(String pkg) {
        if (pkg == null) return;

        switch (pkg) {
            case "com.starbucks.mobilecard":
                displayAppName = "Starbucks";
                displayAppIconRes = R.drawable.starbucks_logo;
                break;

            case "com.cta.cestech":
                displayAppName = "ces";
                displayAppIconRes = R.drawable.ic_launcher_ces;
                break;

            case "com.google.android.apps.tachyon":
                displayAppName = "googlemeet";
                displayAppIconRes = R.drawable.ic_launcher_googlemeet;
                break;

            case "com.walmart.android":
                displayAppName = "walmart";
                displayAppIconRes = R.drawable.ic_launcher_walmart;
                break;

            default:
                // 그 외: 표시 안 함
                displayAppName = "";
                displayAppIconRes = 0;
                break;
        }
    }

    /**
     * 실제 타겟 앱 실행
     * - 설치 안 되어 있으면 Play 스토어 이동
     */
    private void openRealApp(String pkgName) {
        if (pkgName == null) {
            finish();
            return;
        }
        try {
            Intent launchIntent = getPackageManager().getLaunchIntentForPackage(pkgName);
            if (launchIntent != null) {
                startActivity(launchIntent);
            } else {
                // 설치 안 되어있으면 스토어 이동
                Intent playStoreIntent = new Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("market://details?id=" + pkgName)
                );
                startActivity(playStoreIntent);
            }
        } catch (Exception e) {
            Log.e("AppLoadingActivity", "오류: " + e.getMessage());
        }
        finish(); // 로딩 액티비티 종료
    }
}
