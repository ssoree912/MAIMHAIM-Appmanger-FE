// package com.mynewproject;

// import android.content.BroadcastReceiver;
// import android.content.Context;
// import android.content.Intent;
// import android.util.Log;
// import android.widget.Toast;
// import com.google.android.gms.location.Geofence;
// import com.google.android.gms.location.GeofencingEvent;
// import java.util.List;
// import android.os.Bundle;

// public class GeofenceBroadcastReceiver extends BroadcastReceiver {


//     @Override
//     public void onReceive(Context context, Intent intent) {
      
//         // GeofencingEvent를 가져옵니다.
//         GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);

//         // geofencingEvent가 null인지 확인
//         if (geofencingEvent == null) {
//             Log.e("GeofenceBroadcastReceiver", "Geofencing event가 없음");
//             return; // null일 경우 메서드 종료
//         } else {
//             Log.d("GeofenceBroadcastReceiver", "Geofencing event 가 있습니다"+geofencingEvent);

//         }
    

//         // GeofencingEvent에서 오류가 발생했는지 확인
//         if (geofencingEvent.hasError()) {
//             String errorMessage = String.valueOf(geofencingEvent.getErrorCode());
//             Log.e("GeofenceBroadcastReceiver", "Geofencing error: " + errorMessage);
//             return; // 오류가 있을 경우 메서드 종료
//         }

         // 지오펜싱 트리거 타입 확인 (ENTER, EXIT 등)
//         int geofenceTransition = geofencingEvent.getGeofenceTransition();

         // 지오펜싱이 ENTER 또는 EXIT일 경우에만 처리
//         if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER ||
//             geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {

             // 트리거된 지오펜스들 가져오기
//             List<Geofence> triggeringGeofences = geofencingEvent.getTriggeringGeofences();

             // 각 지오펜스에 대해 처리
//             for (Geofence geofence : triggeringGeofences) {
//                 String requestId = geofence.getRequestId();

//                 Intent serviceIntent = new Intent(context, LocationForegroundService.class);

                 // 진입인지 이탈인지 확인 후 메시지 출력
//                 if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER) {
//                     Log.i("GeofenceBroadcastReceiver", "지오펜스 진입: " + requestId);
//                     serviceIntent.putExtra("isCheck", true); // (진입)
//                     serviceIntent.putExtra("requestId", requestId);
//                 } else if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT) {
//                     Log.i("GeofenceBroadcastReceiver", "지오펜스 이탈: " + requestId);
//                     serviceIntent.putExtra("isCheck", false); // (이탈)
//                 }
//                 context.startService(serviceIntent); // 서비스 시작
//             }
//         } else {
//             Log.e("GeofenceBroadcastReceiver", "잘못된 지오펜스 트리거");
//         }
//     }
// }