
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { addUser } from '../services/apiServices';
import 'react-native-get-random-values';

export const initUser = async (): Promise<string | null> => {
  try {
    const existingMemberId = await AsyncStorage.getItem('memberId');
    if (existingMemberId) {
      console.log("MemberId already exists, skipping API call");
      return existingMemberId;
    }

    let uuid = await AsyncStorage.getItem('uuid');
    if (!uuid) {
      uuid = uuidv4();
      await AsyncStorage.setItem('uuid', uuid);
      console.log("Generated and saved new UUID:", uuid);
    }

    console.log("Sending UUID to server to get memberId:", uuid);

    // addUser API 호출
    const response = await addUser(uuid);
    console.log("Response from addUser API:", response);

    if (response?.data?.status === 201) {
      const memberId = response.data.data.memberId.toString();
      console.log("Received new memberId from server:", memberId);
      await AsyncStorage.setItem('memberId', memberId);
      return memberId;
    } else {
      console.warn("Unexpected response status or data:", response?.data);
    }
  } catch (error) {
    console.error('Error initializing user:', error.message || error);
    console.error('Error details:', error.response?.data || error);
  }
  return null;
};
