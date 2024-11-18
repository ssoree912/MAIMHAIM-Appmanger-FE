// utils/nativeStorage.js
import {NativeModules} from 'react-native';

const {MemberIdModule} = NativeModules;

export const saveMemberIdToNative = async memberId => {
  try {
    const result = await MemberIdModule.saveMemberId(memberId);
    console.log(result); // "MemberId 저장 성공" 메시지 확인
  } catch (error) {
    console.error('Error saving memberId to Native:', error);
  }
};

export const getMemberIdFromNative = async () => {
  try {
    const memberId = await MemberIdModule.getMemberId();
    console.log('MemberId from Native:', memberId);
    return memberId;
  } catch (error) {
    console.error('Error getting memberId from Native:', error);
    return null;
  }
};
