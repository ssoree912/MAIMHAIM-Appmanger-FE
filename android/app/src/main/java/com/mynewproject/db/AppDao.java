package com.mynewproject.db;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;

import java.util.List;

@Dao
public interface AppDao {
    @Query("SELECT * FROM app")
    List<App> getALl();

    @Query("SELECT * FROM app where appId = (:appId)")
    App findById(int appId);

    @Insert
    void insertAll(App... apps);

    @Delete
    void delete(App app);

    @Query("SELECT * FROM App WHERE packageName = :packageName LIMIT 1")
    App getAppByPackageName(String packageName);  // 특정 패키지 이름으로 앱 조회

    @Query("UPDATE App SET time = :time, week = :week WHERE packageName = :packageName")
    void updateTimeAndWeek(String packageName, String week, String time);

    @Query("SELECT * FROM App WHERE apName = :name LIMIT 1")
    App getPackageNameByName(String name);  // 특정 이름으로 패키지 이름 조회


    @Query("SELECT * FROM App WHERE packageName = :packageName LIMIT 1")
    App getAppByPackage(String packageName);  // 특정 이름으로 패키지 이름 조회

    @Query("UPDATE App SET count = count + 1 WHERE appId = :appId")
    void incrementCount(int appId); // count 값을 하나 증가시키는 쿼리
    @Query("UPDATE App SET activate = :active WHERE packageName = :packageName")
    void activateApp(String packageName, boolean active);

    @Query("UPDATE App SET isAdd = :active WHERE packageName = :packageName")
    void addApp(String packageName, boolean active);

    @Query("UPDATE App SET timeTriggerActive = :active WHERE packageName = :packageName")
    void activateTimeTrigger(String packageName, boolean active);
    @Query("UPDATE App SET triggerActive = :active WHERE packageName = :packageName")
    void activateLocationTrigger(String packageName, boolean active);
    @Query("UPDATE App SET motionTriggerActive = :active WHERE packageName = :packageName")
    void activateMotionTrigger(String packageName, boolean active);
    @Query("UPDATE App SET triggerType = :type WHERE packageName = :packageName")
    void updateTriggerType(String packageName, TriggerType type);

    @Query("UPDATE APP SET advancedMode = :activate")
    void updateAdvancedAll(boolean activate);@

    Query("UPDATE APP SET advancedMode = :activate WHERE packageName = :packageName")
    void updateAdvanced(boolean activate, String packageName);
}
