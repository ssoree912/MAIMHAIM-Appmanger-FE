package com.mynewproject;

import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiService {

    private static final String TAG = "ApiService";

    // 콜백 인터페이스 정의
    public interface ApiCallback {
        void onSuccess(JSONObject response);
        void onFailure(String errorMessage);
    }

    // POST 요청 메서드
    public static void sendPostRequest(String urlString, JSONObject requestBody, ApiCallback callback) {
        new Thread(() -> {
            try {
                // 서버 URL 설정
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conn.setDoOutput(true);

                // JSON 데이터를 서버에 전송
                OutputStream os = conn.getOutputStream();
                os.write(requestBody.toString().getBytes("UTF-8"));
                os.close();

                // 서버 응답 처리
                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // 서버 응답을 읽음
                    InputStream is = conn.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    // 응답 JSON 파싱 및 성공 콜백 호출
                    JSONObject jsonResponse = new JSONObject(response.toString());
                    callback.onSuccess(jsonResponse);
                } else {
                    callback.onFailure("서버 응답 오류: " + responseCode);
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "서버 요청 중 오류 발생", e);
                callback.onFailure("서버 요청 중 오류 발생: " + e.getMessage());
            }
        }).start();
    }

    // GET 요청 메서드
    public static void sendGetRequest(String urlString, ApiCallback callback) {
        new Thread(() -> {
            try {
                // 서버 URL 설정
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");

                // 서버 응답 처리
                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // 서버 응답을 읽음
                    InputStream is = conn.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    // 응답 JSON 파싱 및 성공 콜백 호출
                    JSONObject jsonResponse = new JSONObject(response.toString());
                    callback.onSuccess(jsonResponse);
                } else {
                    callback.onFailure("서버 응답 오류: " + responseCode);
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "서버 요청 중 오류 발생", e);
                callback.onFailure("서버 요청 중 오류 발생: " + e.getMessage());
            }
        }).start();
    }
}
