import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { ForegroundService } = NativeModules;
const SERVICE_STATUS_KEY = 'isServiceRunning';

// Foreground 서비스 상태 저장
export const saveServiceStatus = async (status: boolean) => {
  try {
    await AsyncStorage.setItem(SERVICE_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.error('Failed to save service status:', error);
  }
};

// Foreground 서비스 상태 불러오기
export const loadServiceStatus = async (): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(SERVICE_STATUS_KEY);
    return status ? JSON.parse(status) : true;
  } catch (error) {
    console.error('Failed to load service status:', error);
    return true;
  }
};

// Foreground 서비스 시작
export const startForegroundService = async () => {
  try {
    await ForegroundService.startService(); // Use await to ensure the promise is resolved or rejected
    await saveServiceStatus(true);
  } catch (error) {
    console.error('Failed to start foreground service:', error);
  }
};

// Foreground 서비스 중지
export const stopForegroundService = async () => {
  try {
    await ForegroundService.stopService(); // Use await for better error handling
    await saveServiceStatus(false);
  } catch (error) {
    console.error('Failed to stop foreground service:', error);
  }
};
