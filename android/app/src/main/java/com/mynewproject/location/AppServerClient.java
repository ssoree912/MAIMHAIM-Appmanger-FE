package com.mynewproject.location;

import android.util.Log;
import org.json.JSONObject;
import okhttp3.*;

import java.io.IOException;

public class AppServerClient {
    private static final String BASE_URL = "http://54.180.201.68:8080/api/v2/apps/";

    public static void sendDataToServer(String packageName, JSONObject payload) {
        String url = BASE_URL + packageName + "/count";

        OkHttpClient client = new OkHttpClient();
        RequestBody body = RequestBody.create(payload.toString(), MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        // Log the URL and Payload
        Log.d("AppServerClient", "Sending data to URL: " + url);
        Log.d("AppServerClient", "Payload: " + payload.toString());

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("AppServerClient", "Failed to send data: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.d("AppServerClient", "Data sent successfully with status code: " + response.code());
                    Log.d("AppServerClient", "Response body: " + response.body().string());
                } else {
                    Log.e("AppServerClient", "Server error with status code: " + response.code());
                    Log.e("AppServerClient", "Error response body: " + response.body().string());
                }
            }

        });
    }
}
