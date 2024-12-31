package com.mynewproject.loading;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.util.TypedValue;
import android.view.View;
import android.view.animation.AlphaAnimation;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import android.widget.ImageView;
import android.widget.TextView;

import com.mynewproject.R;

public class StarbucksLoadingActivity extends Activity {

    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // (A) 메인 레이아웃
        ConstraintLayout mainLayout = new ConstraintLayout(this);
        mainLayout.setId(View.generateViewId());
        mainLayout.setBackgroundColor(Color.WHITE);

        // (B) 원형 로딩 뷰 - 더 크게 (300 x 300)
        View loadingCircle = new View(this);
        loadingCircle.setId(View.generateViewId());
        ConstraintLayout.LayoutParams circleParams = new ConstraintLayout.LayoutParams(300, 300);
        loadingCircle.setLayoutParams(circleParams);

        GradientDrawable circleDrawable = new GradientDrawable();
        circleDrawable.setShape(GradientDrawable.OVAL);
        circleDrawable.setStroke(12, Color.parseColor("#48CBC0"));
        loadingCircle.setBackground(circleDrawable);

        AlphaAnimation fadeAnimation = new AlphaAnimation(0.3f, 1.0f);
        fadeAnimation.setDuration(1000);
        fadeAnimation.setRepeatMode(AlphaAnimation.REVERSE);
        fadeAnimation.setRepeatCount(AlphaAnimation.INFINITE);
        loadingCircle.startAnimation(fadeAnimation);

        mainLayout.addView(loadingCircle);

        // (C) 원 안에 들어갈 로고 이미지 - 더 크게 (160 x 160)
        ImageView logoImage = new ImageView(this);
        logoImage.setId(View.generateViewId());
        logoImage.setImageResource(R.drawable.app_logo);
        ConstraintLayout.LayoutParams logoParams = new ConstraintLayout.LayoutParams(200, 200);
        logoImage.setLayoutParams(logoParams);
        mainLayout.addView(logoImage);

        // (D) 로딩 메시지 (회색, 20sp)
        TextView loadingText = new TextView(this);
        loadingText.setId(View.generateViewId());
        loadingText.setText("Just a few more seconds!");
        loadingText.setTextSize(20);
        loadingText.setTextColor(Color.parseColor("#9496A1")); // 연한 회색
        loadingText.setGravity(View.TEXT_ALIGNMENT_CENTER);
        mainLayout.addView(loadingText);

        // (E) 추가 텍스트 (검정색, 조금 작게 16sp)
        TextView additionalText = new TextView(this);
        additionalText.setId(View.generateViewId());
        additionalText.setText("Getting your Starbucks app ready...");
        additionalText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 16);
        additionalText.setTextColor(Color.BLACK);
        additionalText.setGravity(View.TEXT_ALIGNMENT_CENTER);
        mainLayout.addView(additionalText);

        // (F) 스타벅스 아이콘 - 더 크게 (130 x 130)
        ImageView starbucksIcon = new ImageView(this);
        starbucksIcon.setId(View.generateViewId());
        starbucksIcon.setImageResource(R.drawable.starbucks_logo);

        ConstraintLayout.LayoutParams iconParams = new ConstraintLayout.LayoutParams(
                130, 130
        );
        starbucksIcon.setLayoutParams(iconParams);
        mainLayout.addView(starbucksIcon);

        // (G) 제작자 텍스트: 아래쪽에 크게, 굵게(Bold)
        TextView creatorText = new TextView(this);
        creatorText.setId(View.generateViewId());
        creatorText.setText("MaimHaim");
        creatorText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18); // 조금 더 크게
        creatorText.setTypeface(Typeface.DEFAULT_BOLD);          // 굵게
        creatorText.setTextColor(Color.BLACK);
        creatorText.setGravity(View.TEXT_ALIGNMENT_CENTER);
        mainLayout.addView(creatorText);

        // (H) ConstraintSet
        ConstraintSet constraintSet = new ConstraintSet();
        constraintSet.clone(mainLayout);

        int parentId = mainLayout.getId();
        int circleId = loadingCircle.getId();
        int logoId = logoImage.getId();
        int loadingTextId = loadingText.getId();
        int additionalTextId = additionalText.getId();
        int starbucksIconId = starbucksIcon.getId();
        int creatorTextId = creatorText.getId();

        // -----------------------------------
        // 1) 원형 뷰(loadingCircle) - 중앙(약간 위)
        // -----------------------------------
        constraintSet.connect(circleId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(circleId, ConstraintSet.END, parentId, ConstraintSet.END, 0);
        constraintSet.connect(circleId, ConstraintSet.TOP, parentId, ConstraintSet.TOP, 0);
        constraintSet.connect(circleId, ConstraintSet.BOTTOM, parentId, ConstraintSet.BOTTOM, 0);
        constraintSet.setHorizontalBias(circleId, 0.5f);
        constraintSet.setVerticalBias(circleId, 0.4f);

        // -----------------------------------
        // 2) 로고(logoImage) - 원 내부 중앙
        // -----------------------------------
        constraintSet.connect(logoId, ConstraintSet.START, circleId, ConstraintSet.START, 0);
        constraintSet.connect(logoId, ConstraintSet.END, circleId, ConstraintSet.END, 0);
        constraintSet.connect(logoId, ConstraintSet.TOP, circleId, ConstraintSet.TOP, 0);
        constraintSet.connect(logoId, ConstraintSet.BOTTOM, circleId, ConstraintSet.BOTTOM, 0);
        constraintSet.setHorizontalBias(logoId, 0.5f);
        constraintSet.setVerticalBias(logoId, 0.5f);

        // -----------------------------------
        // 3) 로딩 메시지 - 원형 뷰 아래쪽
        // -----------------------------------
        constraintSet.connect(loadingTextId, ConstraintSet.TOP, circleId, ConstraintSet.BOTTOM, 40);
        constraintSet.connect(loadingTextId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(loadingTextId, ConstraintSet.END, parentId, ConstraintSet.END, 0);
        constraintSet.setHorizontalBias(loadingTextId, 0.5f);

        // -----------------------------------
        // 4) 추가 텍스트 - 로딩 메시지 아래(10dp 간격)
        // -----------------------------------
        constraintSet.connect(additionalTextId, ConstraintSet.TOP, loadingTextId, ConstraintSet.BOTTOM, 10);
        constraintSet.connect(additionalTextId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(additionalTextId, ConstraintSet.END, parentId, ConstraintSet.END, 0);
        constraintSet.setHorizontalBias(additionalTextId, 0.5f);

        // -----------------------------------
        // 5) 스타벅스 아이콘 - 추가 텍스트 아래
        // -----------------------------------
        constraintSet.connect(starbucksIconId, ConstraintSet.TOP, additionalTextId, ConstraintSet.BOTTOM, 40);
        constraintSet.connect(starbucksIconId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(starbucksIconId, ConstraintSet.END, parentId, ConstraintSet.END, 0);
        constraintSet.setHorizontalBias(starbucksIconId, 0.5f);

        // -----------------------------------
        // 6) 제작자 텍스트(creatorText) - 하단 중앙
        // -----------------------------------
        constraintSet.connect(creatorTextId, ConstraintSet.BOTTOM, parentId, ConstraintSet.BOTTOM, 50);
        constraintSet.connect(creatorTextId, ConstraintSet.START, parentId, ConstraintSet.START, 0);
        constraintSet.connect(creatorTextId, ConstraintSet.END, parentId, ConstraintSet.END, 0);
        constraintSet.setHorizontalBias(creatorTextId, 0.5f);

        // 적용
        constraintSet.applyTo(mainLayout);

        // (I) 화면에 표시
        setContentView(mainLayout);

        // (J) 2초 후 스타벅스 앱 실행 및 로딩 종료
        new Handler().postDelayed(() -> {
            String packageName = "com.starbucks.co"; // 스타벅스 앱 패키지 이름
            Intent launchIntent = getPackageManager().getLaunchIntentForPackage(packageName);
            if (launchIntent != null) {
                startActivity(launchIntent);
            }
            finish(); // 로딩 화면 종료
        }, 12000);
    }
}
