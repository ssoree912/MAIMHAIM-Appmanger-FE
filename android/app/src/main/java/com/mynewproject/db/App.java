package com.mynewproject.db;

import androidx.room.Entity;
import androidx.room.PrimaryKey;


@Entity

public class App {
    @PrimaryKey(autoGenerate = true)
    private int appId;
    private String name;
    private String apName;
    private String packageName;
    private boolean isAdd;
    private boolean activate;
    private TriggerType triggerType;
    private boolean triggerActive;
    private boolean timeTriggerActive;
    private boolean motionTriggerActive;
    private boolean advancedMode;
    private boolean isForeGround;


    private String time;
    private String week;
    private int count;

    public int getAppId() {
        return appId;
    }

    public void setAppId(int appId) {
        this.appId = appId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getApName() {
        return apName;
    }

    public void setApName(String apName) {
        this.apName = apName;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public boolean isAdd() {
        return isAdd;
    }

    public void setAdd(boolean add) {
        isAdd = add;
    }

    public boolean isActivate() {
        return activate;
    }

    public void setActivate(boolean activate) {
        this.activate = activate;
    }

    public TriggerType getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(TriggerType triggerType) {
        this.triggerType = triggerType;
    }

    public boolean isTriggerActive() {
        return triggerActive;
    }

    public void setTriggerActive(boolean triggerActive) {
        this.triggerActive = triggerActive;
    }

    public boolean isAdvancedMode() {
        return advancedMode;
    }

    public void setAdvancedMode(boolean advancedMode) {
        this.advancedMode = advancedMode;
    }

    public boolean isForeGround() {
        return isForeGround;
    }

    public void setForeGround(boolean foreGround) {
        isForeGround = foreGround;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public String getWeek() {
        return week;
    }

    public void setWeek(String week) {
        this.week = week;
    }

    public boolean isTimeTriggerActive() {
        return timeTriggerActive;
    }

    public void setTimeTriggerActive(boolean timeTriggerActive) {
        this.timeTriggerActive = timeTriggerActive;
    }

    public boolean isMotionTriggerActive() {
        return motionTriggerActive;
    }

    public void setMotionTriggerActive(boolean motionTriggerActive) {
        this.motionTriggerActive = motionTriggerActive;
    }
}
