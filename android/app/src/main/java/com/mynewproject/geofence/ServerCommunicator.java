package com.mynewproject.geofence;

import android.content.Context;
import android.util.Log;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import com.google.gson.Gson;

public class ServerCommunicator {
    private static final String SERVER_URL = "https://example.com/api/location";

    public static void sendDataToServer(Context context, String geofenceId, String event, double latitude, double longitude) {
        OkHttpClient client = new OkHttpClient();
        MediaType mediaType = MediaType.parse("application/json; charset=utf-8");

        // Create JSON object from DataModel
        String json = new Gson().toJson(new DataModel(geofenceId, event, latitude, longitude));

        RequestBody body = RequestBody.create(json, mediaType);
        Request request = new Request.Builder()
                .url(SERVER_URL)
                .post(body)
                .build();

        client.newCall(request).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("ServerCommunicator", "Failed to send data: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.d("ServerCommunicator", "Response: " + response.body().string());
                } else {
                    Log.e("ServerCommunicator", "Server error: " + response.code());
                }
            }
        });
    }

    // Data model class matching the updated API request format
    static class DataModel {
        String geofenceId;
        String event;
        double latitude;
        double longitude;

        DataModel(String geofenceId, String event, double latitude, double longitude) {
            this.geofenceId = geofenceId;
            this.event = event;
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }
}
