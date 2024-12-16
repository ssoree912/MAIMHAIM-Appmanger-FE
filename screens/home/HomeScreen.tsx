import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    AppRegistry,
    Image,
    Linking,
    NativeEventEmitter,
    NativeModules,
    PanResponder,
    Pressable,
    Text as RNText,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../theme/theme';
import { styles } from '../../styles/styleGuide';
import { initUser } from '../../utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadServiceStatus, saveServiceStatus } from '../../utils/foregroundServiceUtils';
import {useRecoilState} from 'recoil';
import axios from 'axios';
import { getTriggerCounts,addUser } from '../../services/apiServices'; // 앱 매니저 횟수 API 가져오기
import DatabaseService from '../../utils/DatabaseService';


const {ForegroundService, MemberIdModule} = NativeModules;

const IS_ACTIVE_KEY = 'isActive';
const HomeScreen: React.FC = () => {
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isServiceRunning, setIsServiceRunning] = useState<boolean | undefined>(undefined);

       const [totalCount, setTotalCount] = useState(0);

  const position = useRef(new Animated.Value(isActive ? 45 : -45)).current;

   useEffect(() => {
           const initializeUUID = async () => {
             const storedMemberId = await AsyncStorage.getItem('memberId');
             if (storedMemberId) {
               console.log('Existing memberId found:', storedMemberId);
              //  await saveMemberIdToNative(storedMemberId); // iOS로 전달
               // Android Native에 저장
               await MemberIdModule.saveMemberId(storedMemberId);
             } else {
               const newMemberId = await initUser();
               if (newMemberId) {
                 console.log(
                   'User initialized with new memberId:',
                   newMemberId,
                 );
                 await AsyncStorage.setItem('memberId', newMemberId);
                //  await saveMemberIdToNative(storedMemberId); // iOS로 전달
                 // Android Native에 저장
                 await MemberIdModule.saveMemberId(newMemberId);
               }
             }
           };
           initializeUUID();
         }, []);

useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        console.log('Checking database connection...');
        await DatabaseService.getAllApps(); // 모든 레코드 조회
      } catch (error) {
        console.error('Error accessing database:', error);
      }
    };

    checkDatabaseConnection();
  }, []);


    // 초기 Foreground 서비스 및 isActive 상태 설정
    useEffect(() => {
        const initializeStatus = async () => {
            const status = await loadServiceStatus();
            const activeStatus = await AsyncStorage.getItem(IS_ACTIVE_KEY);
            setIsServiceRunning(status ?? true);
            setIsActive(activeStatus ? JSON.parse(activeStatus) : true);

            const memberId = await AsyncStorage.getItem('memberId');

            if (status === undefined || status) {
                try {
                    await ForegroundService.startService();
                    await saveServiceStatus(true);
                } catch (error) {
                   // console.error("Failed to start foreground service", error);
                }
            }
        };
        initializeStatus();
    }, []);

    // Foreground 서비스 상태 및 isActive 상태를 저장하고 업데이트
    const toggleForegroundService = async () => {
        const newServiceStatus = !isServiceRunning;
        setIsServiceRunning(newServiceStatus);
        setIsActive(newServiceStatus);
        await AsyncStorage.setItem(IS_ACTIVE_KEY, JSON.stringify(newServiceStatus));
        if (newServiceStatus) {
            await ForegroundService.startService();
            await saveServiceStatus(true);
        } else {
            await ForegroundService.stopService();
            await saveServiceStatus(false);
        }
    };

    // 버튼 클릭 시 isActive와 Foreground 서비스 상태를 함께 변경
    const handleButtonPress = () => {
        toggleForegroundService();
    };

    useEffect(() => {
        Animated.timing(position, {
            toValue: isActive ? 56 : -56,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [isActive]);


    useEffect(() => {
        const fetchTotalCount = async () => {
            const count = await DatabaseService.showCounts();
            if (count !== null) {
                setTotalCount(count);
            }
        };

        fetchTotalCount();
    }, []);

     return (
            <MainView isActive={isActive}>

                <MainInner>
                    <ContentView>

                        <Image
                            source={
                                isActive
                                    ? require('../../assets/img/homeLogo_active.png')
                                    : require('../../assets/img/homeLogo.png')
                            }
                            style={{ width: 64, height: 86 }}
                        />
                        <Text
                            style={{
                                fontWeight: 600,
                                fontSize: 14,
                                margin: 20,
                                color: isActive ? '#fff' : styles.colors.gray[600],
                            }}
                        >
                            마임하임이 {isActive ? '일하고 있어요!' : '쉬고 있어요'}
                        </Text>
                        <BtnView isActive={isActive} onPress={handleButtonPress}>
                            <CircleBtn
                                isActive={isActive}
                                style={{
                                    transform: [{ translateX: position }],
                                }}
                            >
                                {isActive ? <Bar /> : <Dot />}
                            </CircleBtn>
                        </BtnView>

                        <TextView>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: 400,
                                    textAlign: 'center',
                                    color: isActive
                                        ? styles.colors.gray[100]
                                        : styles.colors.gray[600],
                                }}
                            >
                                지금까지 터치를
                            </Text>
                            <TouchCountContainer>
                                <TouchCount isActive={isActive}>
                                    <CountText isActive={isActive}>
                                        {totalCount.toLocaleString()}{' '}
                                    </CountText>
                                </TouchCount>
                                <StatusText isActive={isActive}>회 줄였어요!</StatusText>
                            </TouchCountContainer>
                        </TextView>
                    </ContentView>
                </MainInner>
            </MainView>
        );
    };

export default HomeScreen;

type isActiveBTN = {
  isActive: boolean;
};

const LogoContainer = styled(View)`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const LogoImage = styled.Image`
  width: 130px;
  height: 58px;
`;


const MainView = styled(View)<{ isActive?: boolean }>`
  flex: 1;
  background-color: ${({ isActive }) =>
    isActive ? styles.colors.brand.primary : '#fff'};
  justify-content: center;
  align-items: center;
  padding-bottom: 80px;
`;

const MainInner = styled(View)`
  padding: 0px 80px;
`;

const TextView = styled(View)`
  justify-content: center;
  align-items: center;
`;

const ContentView = styled(View)`
  justify-content: center;
  align-items: center;
`;

const BtnView = styled(Pressable)<isActiveBTN>`
  border-radius: 100px;
  width: 230px;
  background-color: ${({ isActive }) =>
    isActive ? styles.colors.brand.primary : '#eee'};
  height: 50px;
  position: relative;
  justify-content: center;
  align-items: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
`;

const CircleBtn = styled(Animated.View)<isActiveBTN>`
  width: 106px;
  height: 40px;
  border-radius: 100px;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Dot = styled(View)`
  width: 24px;
  height: 24px;
  border-radius: 100px;
  border-width: 2px;
  border-color: ${styles.colors.gray[200]};
  background-color: transparent;
`;

const Bar = styled(View)`
  width: 2px;
  height: 20px;
  background-color: ${styles.colors.gray[200]};
`;

const TouchCountContainer = styled(View)`
  margin-top: 6px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;


const TouchCount = styled(View)<{isActive?: boolean}>`
  padding: 4px 16px;
  border-radius: 12px;
  margin-right: 5px;
  background-color: ${({isActive}) =>
    isActive ? '#fff' : styles.colors.brand.primary};
`;

const CountText = styled(Text)<{isActive?: boolean}>`
  font-size: 24px;
  font-weight: bold;
  color: ${({isActive}) => (isActive ? styles.colors.brand.primary : '#fff')};
`;

const StatusText = styled(Text)<{isActive?: boolean}>`
  font-size: 16px;
  color: ${({isActive}) => (isActive ? '#fff' : styles.colors.gray[600])};
`;
