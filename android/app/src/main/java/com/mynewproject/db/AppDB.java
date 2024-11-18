package com.mynewproject.db;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import android.content.Context;

import com.mynewproject.db.App;
import com.mynewproject.db.AppDao;

@Database(entities = {App.class}, version = 1) // 엔티티와 버전 정보
public abstract class AppDB extends RoomDatabase {
    private static AppDB instance;

    public abstract AppDao appDao(); // AppDao 인터페이스 제공

    public static synchronized AppDB getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(context.getApplicationContext(),
                            AppDB.class, "app_database")
                    .fallbackToDestructiveMigration() // 버전 변경 시 데이터베이스를 초기화할지 여부
                    .build();
        }
        return instance;
    }
}