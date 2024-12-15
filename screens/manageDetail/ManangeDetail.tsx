import React, { useState, useEffect } from 'react';
import {
  Pressable,
  View,
  ScrollView,
  Modal,
  Alert,
  NativeModules,
} from 'react-native';
import { Text } from '../../theme/theme';
import { useNavigate, useParams } from 'react-router-native';
import { useRecoilState } from 'recoil';
import { AddApplication } from '../../atom/atom';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import OptionsSwitch from '../../components/switch/OptionsSwitch';
import { styles } from '../../styles/styleGuide';
import ShortSwitch from '../../components/switch/ShortSwitch';
import { getTriggers } from '../../services/apiServices';
import { activateTrigger } from '../../services/apiServices';
import { activateAdvancedApp } from '../../services/apiServices'; // 고급모드 API 호출
import { getAppDetails } from '../../services/apiServices'; // 고급모드 API 호출
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertModal from '../../components/manageComponent/AlterModal';
import NotificationModal from '../../components/manageComponent/NotificationModal'; // NotificationModal 임포트

const ManangeDetail = () => {
  const [toggleStates, setToggleStates] = useState(true);
    const navigate = useNavigate();
    const [addApp, setAddApp] = useRecoilState(AddApplication);
    const { id } = useParams();
    const selectedItem = addApp
      ? addApp.find(item => item.appId === (id ? parseInt(id) : 0))
      : null;

    const [conditionVisible, setConditionVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [allowed, setAllowed] = useState(false);
   const [selectedOption, setSelectedOption] = useState('run');
    const [triggers, setTriggers] = useState([]);
    const [initialDays, setInitialDays] = useState<string[]>([]); // 초기 요일 데이터
  const [initialTime, setInitialTime] = useState<string | null>(null); // 서버에서 받은 시간
  const [triggerId, setTriggerId] = useState<number | null>(null);
  const {ActivateModule} = NativeModules;
  const [advancedActivate, setAdvancedActivate] = useState(false); // 고급 모드 상태
const [memberId, setMemberId] = useState<number | null>(null); // AsyncStorage에서 가져온 memberId
  const [modalMessage, setModalMessage] = useState('');
  const [appType, setAppType] = useState<string | null>(null); // 앱 타입

 // AsyncStorage에서 memberId 가져오기
 const fetchMemberId = async () => {
   try {
     const storedMemberId = await AsyncStorage.getItem('memberId');
     if (!storedMemberId) throw new Error('Member ID not found in AsyncStorage.');
     const memberId = parseInt(storedMemberId, 10);
     console.log('Fetched Member ID:', memberId);
     return memberId; // 반환값 추가
   } catch (error) {
     console.error('Error fetching memberId:', error);
     Alert.alert('오류', '사용자 정보를 가져오는 중 문제가 발생했습니다.');
     throw error;
   }
 };

 // AsyncStorage에서 고급 모드 상태 저장
 const saveAdvancedActivateState = async (appId, memberId, state) => {
   try {
     const key = `advancedActivate_${memberId}_${appId}`;
     await AsyncStorage.setItem(key, JSON.stringify(state));
     console.log(`Saved advancedActivate state: ${state} for appId: ${appId}`);
   } catch (error) {
     console.error('Error saving advanced activate state:', error);
     Alert.alert('오류', '고급 모드 상태 저장 중 문제가 발생했습니다.');
   }
 };

 // AsyncStorage에서 고급 모드 상태 가져오기
 const fetchAdvancedActivateState = async (appId, memberId) => {
   try {
     const key = `advancedActivate_${memberId}_${appId}`;
     const storedState = await AsyncStorage.getItem(key);
     return storedState ? JSON.parse(storedState) : false; // 기본값: 비활성화(false)
   } catch (error) {
     console.error('Error fetching advanced activate state:', error);
     Alert.alert('오류', '고급 모드 상태 불러오기 중 문제가 발생했습니다.');
     return false;
   }
 };

// 고급 모드 상태 토글
const toggleAdvancedMode = async () => {
  if (!selectedItem || !memberId) return;

  const newActivateState = !advancedActivate; // 새로운 상태
  setAdvancedActivate(newActivateState); // 상태 업데이트
  setToggleStates(!newActivateState);

  try {
    // 서버에 상태 전송
    await activateAdvancedApp(memberId, selectedItem.appId, newActivateState);

    // 새로운 상태 저장
    await saveAdvancedActivateState(selectedItem.appId, memberId, newActivateState);

    // `type`에 따른 동작 수행
    if (newActivateState && appType) {
      console.log(`Activating mode for appType: ${appType}`);
      switch (appType) {
        case 'LOCATION':
          setSelectedOption('위치 기반');
          break;
        case 'TIME':
          setSelectedOption('시간 기반');
          break;
        case 'SCHEDULE':
          setSelectedOption('일정 기반');
          break;
        case 'MOTION':
          setSelectedOption('모션 기반');
          break;
        default:
          setSelectedOption('run');
      }
     
    } else if (!newActivateState) {
      setSelectedOption('run'); // 기본 상태로 복원
     // Alert.alert('성공', '고급 모드가 비활성화되었습니다.');
    }
  } catch (error) {
    console.error('Error toggling advanced mode:', error);
    Alert.alert('오류', '고급 모드 상태 변경 중 문제가 발생했습니다.');
  }
};

// 앱 상세 정보 가져오기
const fetchAppDetails = async (appId, memberId) => {
  try {
    const appDetails = await getAppDetails(appId, memberId);
    const storedState = await fetchAdvancedActivateState(appId, memberId);
    setAdvancedActivate(storedState); // AsyncStorage 상태 반영
    setAppType(appDetails.type || null); // 앱 타입 업데이트
    setToggleStates(!storedState); // 고급모드일 때 toggleStates 설정
  } catch (error) {
    console.error('Error fetching app details:', error);
    Alert.alert('오류', '앱 정보를 불러오는 중 문제가 발생했습니다.');
    throw error;
  }
};

 // 초기화 (useEffect)
useEffect(() => {
  const initializeAppDetails = async () => {
    try {
      const fetchedMemberId = await fetchMemberId();
      setMemberId(fetchedMemberId);
      if (selectedItem?.appId) {
        await fetchAppDetails(selectedItem.appId, fetchedMemberId);
      }
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  };

  initializeAppDetails();
}, [selectedItem?.appId]);


const fetchTriggers = async () => {
  try {
    const response = await getTriggers(selectedItem.appId);
    const fetchedTriggers = response.data.triggers;

    if (fetchedTriggers && fetchedTriggers.length > 0) {
      setTriggers(fetchedTriggers);

      const activeTrigger = fetchedTriggers.find(trigger => trigger.activate === true);

      if (activeTrigger) {
        console.log('Active Trigger Found:', activeTrigger);

        setAllowed(true);
        setSelectedOption(
          activeTrigger.type === 'LOCATION'
            ? '위치 기반'
            : activeTrigger.type === 'TIME'
            ? '시간 기반'
            : activeTrigger.type === 'SCHEDULE'
            ? '일정 기반'
            : activeTrigger.type === 'MOTION'
            ? '모션 기반'
            : 'run'
        );

        setTriggerId(activeTrigger.triggerId);

        if (activeTrigger.type === 'TIME') {
          console.log('Active Trigger Value:', activeTrigger.triggerValue);

          // 초기화 시 한 번만 값 설정
          if (!initialTime) setInitialTime(activeTrigger.triggerValue.time || '00:00:00');
          if (initialDays.length === 0) setInitialDays(parseDaysFromWeekString(activeTrigger.triggerValue.week || ''));
        }
      } else {
        console.log('No active trigger, setting default values.');
        setInitialTime('00:00:00');
        setInitialDays([]);
        setSelectedOption('run');
        setAllowed(false);
        setTriggerId(null);
      }
    }
  } catch (error) {
    console.error('Error fetching triggers:', error);
    Alert.alert('오류', '트리거 데이터를 불러오는 중 문제가 발생했습니다.');
  }
};


useEffect(() => {
  if (!toggleStates && selectedItem?.appId) {
    console.log('Fetching triggers for appId:', selectedItem.appId);
    fetchTriggers(); // 상태가 변경되지 않으면 한 번만 호출
  }
}, [toggleStates, selectedItem?.appId]); // 의존성 배열에 꼭 필요한 값만 포함


 const parseDaysFromWeekString = (weekString: string) => {
    const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return weekString.split('').map((day, index) => day === 'T' ? daysOfWeek[index] : '').filter(Boolean);
  };

 useEffect(() => {
    console.log('Allowed state changed:', allowed);
  }, [allowed]);

  useEffect(() => {
    console.log('Selected Option changed:', selectedOption);
  }, [selectedOption]);

  useEffect(() => {
    console.log('Initial Time changed:', initialTime);
  }, [initialTime]);



  const addresses = [
    {
      roadName: `${selectedItem.name} 서대문 지점`,
      lotName: "서울특별시 서대문구 연세로 50",
    },
    {
      roadName: `${selectedItem.name} 광한리 지점`,
      lotName: "강원도 강릉시 경포로 365",
    },
    {
      roadName: `${selectedItem.name} 사당역 지점`,
      lotName: "서울특별시 동작구 사당로 300",
    },
  ];


  const onAllowedPress = async () => {
    setAllowed(!allowed); // allowed 상태를 토글
    if (triggerId && selectedItem) {
      try {
        // 현재 선택된 옵션에 해당하는 트리거를 가져옴
        const selectedTrigger = triggers.find(
          trigger =>
            (selectedOption === '위치 기반' && trigger.type === 'LOCATION') ||
            (selectedOption === '시간 기반' && trigger.type === 'TIME') ||
            (selectedOption === '일정 기반' && trigger.type === 'SCHEDULE') ||
            (selectedOption === '모션 기반' && trigger.type === 'MOTION') // '모션 기반' 처리
        );

        if (!selectedTrigger) {
          throw new Error('해당 트리거를 찾을 수 없습니다.');
        }

        console.log(
          `Sending request to update trigger activation for triggerId: ${
            selectedTrigger.triggerId
          }, new allowed state: ${!allowed}`,
        );

        // API로 상태 업데이트
        const response = await activateTrigger(
          selectedItem.appId,
          selectedTrigger.triggerId,
          !allowed,
        );

        console.log(
          `Trigger ${!allowed ? 'enabled' : 'disabled'} for trigger ID: ${
            selectedTrigger.triggerId
          }`,
          response,
        );

        // NativeModule 호출로 트리거 활성화 상태 업데이트
        await ActivateModule.activateTrigger(
          selectedItem.packageName,
          selectedTrigger.type,
          !allowed,
        );

        // allowed 상태 업데이트
        setAllowed(!allowed);
      } catch (error) {
        console.error('Error updating trigger activation status:', error);
        Alert.alert('오류', '트리거 활성화 상태 변경 중 문제가 발생했습니다.');
      }
    }
  };


  const IconTest = () => {
    setConditionVisible(true);
    console.log('아이콘 바꾸자');
  };

  const closeConditionModal = () => {
    setConditionVisible(false);
    console.log(`Selected Option: ${selectedOption}`);
  };

  const [toggle2, setToggle2] = useState(true);

  const onIconPress = () => {
    setToggle2(!toggle2);
    console.log('onIconPress');
  };

const handleOptionPress = async (optionName) => {
  // 선택된 옵션 설정
  setSelectedOption(optionName);

    // "모션 기반" 조건일 때 알림 창 표시
    if (optionName === '일정 기반') {
      setModalVisible(true); // 모션 기반 선택 시 알림 창 표시
      return;
    }

  // 선택한 옵션에 따라 트리거를 찾음
  const selectedTrigger = triggers.find(
    (trigger) =>
      (optionName === '위치 기반' && trigger.type === 'LOCATION') ||
      (optionName === '시간 기반' && trigger.type === 'TIME') ||
      (optionName === '일정 기반' && trigger.type === 'SCHEDULE') ||
      (optionName === '모션 기반' && trigger.type === 'MOTION') // '모션 기반' 처리
  );

  if (selectedTrigger) {
    // 트리거 ID와 상태 반영
    setTriggerId(selectedTrigger.triggerId);
    setAllowed(selectedTrigger.activate);

    // 트리거 활성 상태 업데이트
    try {
      const updatedAllowed = !selectedTrigger.activate;
      const requestBody = {
        foreGround: selectedTrigger.foreGround,
        triggerValue: selectedTrigger.triggerValue,
        type: selectedTrigger.type, // 선택된 트리거의 타입을 설정
      };
      console.log('Updating trigger with request body:', requestBody);

      // activateTrigger 호출 시 타입 포함 요청 본문 전달
      await activateTrigger(
        selectedItem.appId,
        selectedTrigger.triggerId,
        updatedAllowed,
        requestBody,
      );

      await ActivateModule.activateTrigger(
        selectedItem.packageName,
        selectedTrigger.type,
        updatedAllowed,
      );

      setAllowed(updatedAllowed);
      console.log(
        `${optionName} 트리거 활성 상태가 ${
          updatedAllowed ? '활성화' : '비활성화'
        }되었습니다.`,
      );
    } catch (error) {
      console.error('Failed to update trigger activation:', error);
      Alert.alert('오류', '트리거 활성화 상태 변경 중 문제가 발생했습니다.');
    }
  } else {
    // 트리거가 없으면 기본 옵션 'run'으로 처리
    setSelectedOption('run');
    setTriggerId(null);
    setAllowed(false);
  }
};





  const [settingsOptions, setSettingsOptions] = useState([
    {name: '백그라운드 실행', isSelected: true},
    {name: '화면 띄우기', isSelected: false},
  ]);

  const onOptionSelect = (optionName: string) => {
    setSettingsOptions(prevOptions =>
      prevOptions.map(option =>
        option.name === optionName
          ? {...option, isSelected: true}
          : {...option, isSelected: false},
      ),
    );
  };




  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const onAddressScreen = () => {
    setAddressModalVisible(true);
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#fff'}}>
      <Container>
        {selectedItem ? (
          <>
            <HeaderView>
              <BackButton onPress={() => navigate(-1)}>
                <Icon name="chevron-back" size={24} color="#000" />
              </BackButton>
              <AppName style={{fontWeight: 'bold', fontSize: 22}}>
                {selectedItem.name}
              </AppName>
 {/* 고급 모드 전환 버튼 */}
    <ToggleBtn onPress={toggleAdvancedMode} toggleStates={advancedActivate}>
      <SwitchText toggleStates={advancedActivate}>
        {advancedActivate ? '고급모드' : '기본모드'}
      </SwitchText>
      <CircleBtn toggleStates={advancedActivate} />
    </ToggleBtn>

  </HeaderView>
            {toggleStates && (
              <>
                <Title>위치 설정</Title>
                <LocationBox>
                  <Icon name="location-outline" size={20} color="#6e6e6e" />
                  <LocationText>{selectedItem.name} 전 지점</LocationText>
                  <EditButton>
                    <Icon name="pencil-outline" size={20} color="#6e6e6e" />
                  </EditButton>
                </LocationBox>
              </>
            )}

            {!toggleStates && (
              <>
                <TitleText>세부 설정하기</TitleText>

                <FeatureHeder>
                  <HeaderText
                    style={{flex: 2, textAlign: 'left', paddingLeft: 16}}>
                    기능
                  </HeaderText>
                  <HeaderText style={{flex: 1}}>허용 여부</HeaderText>
                  <HeaderText style={{flex: 1}}>더보기</HeaderText>
                  <HeaderText style={{flex: 1, maxWidth: 32}}>조건</HeaderText>
                </FeatureHeder>

                <FeatureContainer>
                  <Inner>
                    <FeatureTop>
                      <ItemText allowed={allowed}>
                        {selectedOption === 'run'
                          ? '앱 실행하기'
                          : selectedOption}
                      </ItemText>

                      <ShortSwitch
                        allowed={allowed}
                        onAllowedPress={onAllowedPress} // 트리거 활성화 API 호출
                      />
                      <Pressable
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          onIconPress();
                        }}>
                        <Icon
                          name={toggle2 ? 'chevron-up' : 'chevron-down'}
                          size={24}
                          color="#000"
                        />
                      </Pressable>
                    </FeatureTop>
                    {toggle2 && (
                      <>
                        <FeatureBottom>
                          {console.log('OptionsSwitch Props:', {
                            settingsOptions,
                            selectedName: selectedOption,
                            initialDays,
                            initialTime,
                          })}
                          <OptionsSwitch
                            appId={selectedItem.appId}
                            triggerId={triggerId}
                            settingsOptions={settingsOptions}
                            onOptionSelect={onOptionSelect}
                            packageName={selectedItem.packageName}
                            selectedName={selectedOption}
                            initialDays={initialDays}
                            initialTime={initialTime || '00:00:00'} // Default value
                          />
                        </FeatureBottom>
                        {selectedOption === '모션 기반' && (
                          <LocationMotionText>
                            <Text
                              style={{
                                color: styles.colors.gray[600],
                                fontSize: 12,
                              }}>
                              * 설정한 위치에서 모션을 하면 앱이 실행되요
                            </Text>
                          </LocationMotionText>
                        )}

                        {selectedOption !== '시간 기반' && (
                          <LocationBox2 onPress={onAddressScreen}>
                            <Icon
                              name="location-outline"
                              size={20}
                              color="#6e6e6e"
                            />
                            <LocationText>
                              {selectedItem.name} 전 지점
                            </LocationText>
                            <EditButton>
                              <Icon
                                name="pencil-outline"
                                size={20}
                                color="#6e6e6e"
                              />
                            </EditButton>
                          </LocationBox2>
                        )}
                      </>
                    )}
                  </Inner>
                  <FeatureRight
                    color={
                      selectedOption === 'run'
                        ? '#FFA4A4'
                        : selectedOption === '위치 기반'
                        ? '#FFA4A4'
                        : selectedOption === '모션 기반'
                        ? '#91E4C5'
                        : selectedOption === '시간 기반'
                        ? '#A1AAFF'
                        : selectedOption === '일정 기반'
                        ? '#6EC2EA'
                        : '#CCCCCC'
                    }
                    onPress={() => {
                      IconTest();
                    }}>
                    <Tag>
                      <Icon
                        name={
                          selectedOption === 'run'
                            ? 'map-outline'
                            : selectedOption === '위치 기반'
                            ? 'map-outline'
                            : selectedOption === '모션 기반'
                            ? 'walk-outline'
                            : selectedOption === '시간 기반'
                            ? 'time-outline'
                            : selectedOption === '일정 기반'
                            ? 'calendar-outline'
                            : '#CCCCCC'
                        }
                        size={24}
                        color="#fff"
                      />
                    </Tag>
                  </FeatureRight>
                </FeatureContainer>

                <Modal
                  transparent={true}
                  visible={conditionVisible}
                  animationType="slide"
                  onRequestClose={closeConditionModal}>
                  <ModalContainer>
                    <ModalContent>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: 'bold',
                          padding: 10,
                          color: styles.colors.gray[400],
                        }}>
                        조건 선택
                      </Text>
                      <OptionWrap>
                        <Option
                          onPress={() => handleOptionPress('위치 기반')}
                          style={{
                            backgroundColor:
                              selectedOption === '위치 기반'
                                ? styles.colors.gray[200]
                                : '#fff',
                          }}>
                          <OptionText>위치 기반</OptionText>
                          <OptionIcon color={'FFA4A4'}>
                            <Icon name="map-outline" size={24} color="#fff" />
                          </OptionIcon>
                        </Option>
                        {/* 모션 기반 */}
                        <Option
                          onPress={() => handleOptionPress('모션 기반')}
                          style={{
                            backgroundColor:
                              selectedOption === '모션 기반'
                                ? styles.colors.gray[200]
                                : '#fff',
                          }}>
                          <OptionText>모션 기반</OptionText>
                          <OptionIcon color={'91E4C5'}>
                            <Icon name="walk-outline" size={24} color="#fff" />
                          </OptionIcon>
                        </Option>
                        {/* 모션 기반 */}
                        <Option
                          onPress={() => handleOptionPress('시간 기반')}
                          style={{
                            backgroundColor:
                              selectedOption === '시간 기반'
                                ? styles.colors.gray[200]
                                : '#fff',
                          }}>
                          <OptionText>시간 기반</OptionText>
                          <OptionIcon color={'A1AAFF'}>
                            <Icon name="time-outline" size={24} color="#fff" />
                          </OptionIcon>
                        </Option>
                        <Option
                          onPress={() => handleOptionPress('일정 기반')}
                          style={{
                            backgroundColor:
                              selectedOption === '일정 기반'
                                ? styles.colors.gray[200]
                                : '#fff',
                          }}>
                          <OptionText
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Text>일정 기반</Text>
                            <Text>{'\u00A0'}</Text>
                            <Text>{'\u00A0'}</Text>
                            <Text
                              style={{
                                color: styles.colors.gray[400],
                                fontSize: 12,
                              }}>
                              *캘린더와 연동돼요
                            </Text>
                          </OptionText>
                          <OptionIcon color={'6EC2EA'}>
                            <Icon
                              name="calendar-outline"
                              size={24}
                              color="#fff"
                            />
                          </OptionIcon>
                        </Option>
                      </OptionWrap>
                      <CloseButton onPress={closeConditionModal}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 'bold',
                          }}>
                          설정 완료
                        </Text>
                      </CloseButton>
                    </ModalContent>
                  </ModalContainer>
                </Modal>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={addressModalVisible}
                  onRequestClose={() => setAddressModalVisible(false)}>
                  <CenteredView>
                    <AdressModalContent>
                      {addresses.map((address, index) => (
                        <>
                          <ModalTitle>위치명</ModalTitle>

                          <AddressContainer key={index}>
                            <ButtonGroup>
                              <ButtonText>도로명</ButtonText>
                              <ButtonText>지번</ButtonText>
                            </ButtonGroup>
                            <TextGroup>
                              <AddressText>{address.roadName}</AddressText>
                              <AddressText>{address.lotName}</AddressText>
                            </TextGroup>
                          </AddressContainer>
                          {index < addresses.length - 1 && <Separator />}
                        </>
                      ))}
                      <AddressButton
                        onPress={() => setAddressModalVisible(false)}>
                        <CloseButtonText>창닫기</CloseButtonText>
                        <CloseIcon
                          name="close-outline"
                          size={16}
                          color="#333"
                        />
                      </AddressButton>
                    </AdressModalContent>
                  </CenteredView>
                </Modal>
                 <AlertModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                            message="일정 기반 설정은 준비 중입니다!"
                          />
              </>
            )}
          </>


        ) : (
          <Text>해당 아이템을 찾을 수 없습니다.</Text>
        )}
      </Container>
      <View style={{padding: 20}}></View>
    </ScrollView>
  );
  };

  export default ManangeDetail;

type isActiveBtn = {
  isActive?: boolean;
  showcategory?: boolean;
};

const Container = styled(View)`
  padding: 50px 20px;
`;
const HeaderView = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 30px;
`;

const BackButton = styled(Pressable)`
  left: -10px;
  padding: 10px;
`;

const AppName = styled(Text)``;

const ToggleBtn = styled(Pressable)<{ toggleStates: boolean }>`
  width: 124px;
  background-color: ${({ toggleStates }) =>
    toggleStates ? styles.colors.brand.primary : styles.colors.gray[300]};
  height: 36px;
  border-radius: 25px;
  position: relative;
  justify-content: center;
  display: flex;
  margin-left: auto;
`;

const SwitchText = styled(Text)<{toggleStates: boolean}>`
  color: #fff;
  font-size: 14px;
  margin-left: ${({toggleStates}) => (toggleStates ? '55px' : '15px')};
`;

const CircleBtn = styled(View)<{toggleStates: boolean}>`
  width: 48px;
  height: 28px;
  border-radius: 100px;
  background: #fff;
  position: absolute;
  right: 3px;
  ${({toggleStates}) => (toggleStates ? 'left:3px;' : 'right:3px;')}
`;

const Title = styled(Text)`
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
`;

const LocationBox = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${styles.colors.gray[100]};
  padding: 12px;
  border-radius: 10px;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const LocationBox2 = styled(Pressable)`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  padding: 8px;
  border-radius: 10px;
  justify-content: space-between;
  margin: 0 16px;
  margin-bottom: 16px;
`;

const LocationText = styled(Text)`
  font-size: 14px;
  color: #333;
  margin-left: 10px;
`;

const EditButton = styled(Pressable)`
  padding: 4px;
`;

const FeatureHeder = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderText = styled.Text`
  color: ${styles.colors.gray[400]};
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  font-size: 12px;
`;

const TitleText = styled.Text`
  color: #000;
  font-size: 16px;
  font-weight: 500;
  padding: 20px 0px;
`;

const FeatureContainer = styled(View)`
  width: 100%;
  margin: 8px 0;
  border-radius: 15px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background-color: ${styles.colors.gray[100]};
`;

const FeatureTop = styled(View)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  height: 60px;
`;

const Tag = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 32px;
  border-radius: 15px 15px 15px 0;
  align-self: stretch;
`;

const ItemText = styled(Text)<{allowed: boolean}>`
  color: ${({allowed}) =>
    allowed ? styles.colors.gray[800] : styles.colors.gray[400]};
  font-weight: ${({allowed}) => (allowed ? 500 : 'normal')};
  padding-left: 16px;
  flex: 2;
  font-size: 16px;
`;

const FeatureBottom = styled(View)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;
`;

const FeatureRight = styled(Pressable)<{color: string}>`
  width: 32px;
  background-color: blue;
  border-radius: 15px 15px 15px 0px;
  align-items: center;
  justify-content: center;
  background-color: ${({color}) => `${color}`};
`;
const Inner = styled(View)`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ModalContainer = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: flex-end;
`;

const CenteredView = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled(View)`
  width: 100%;
  padding: 20px;
  background-color: white;
  border-radius: 30px 30px 0 0;
  align-items: center;
  background-color: ${styles.colors.gray[100]};
`;

const Option = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  width: 100%;
  background-color: #fff;
  border-radius: 15px;
`;

const OptionText = styled(Text)`
  padding: 0 20px;
  font-size: 16px;
  flex: 3;
`;

const OptionIcon = styled(View)<{color: string}>`
  flex: 1;
  background-color: ${({color}) => `#${color}`};
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 15px 15px 15px 0;
  min-width: 30px;
`;

const CloseButton = styled(Pressable)`
  margin-top: 20px;
  padding: 10px 40px;
  background-color: #48cbc0;
  border-radius: 10px;
  width: 100%;
  align-items: center;
`;

const OptionWrap = styled(View)`
  margin-top: 10px;
  display: flex;
  gap: 16px;
`;

const AddressContainer = styled(View)`
  margin-top: 10px;
  display: flex;
  flex-direction: row;
`;

const ButtonGroup = styled(View)`
  flex-direction: column;
  margin-bottom: 10px;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const TextGroup = styled(View)`
  flex-direction: column;
  margin-bottom: 10px;
  gap: 5px;
  align-items: flex-start;
  justify-content: center;
  margin-left: 5px;
`;

const AdressModalContent = styled(View)`
  width: 90%;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  align-items: flex-start;
`;

const ModalTitle = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0;
`;

const ButtonText = styled(Text)<{selected?: boolean}>`
  color: ${({selected}) => (selected ? '#5B86E5' : '#666')};
  font-size: 14px;
  padding: 2px 5px;
  border: 1px solid ${styles.colors.gray[400]};
  min-width: 50px;
  text-align: center;
  border-radius: 100px;
`;

const AddressText = styled(Text)`
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
`;

const Separator = styled(View)`
  height: 1px;
  width: 100%;
  background-color: #e0e0e0;
  margin-top: 10px;
`;

const AddressButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 10px;
  width: 100%;
`;

const CloseButtonText = styled(Text)`
  font-size: 16px;
  color: #333;
  margin-right: 8px;
`;

const CloseIcon = styled(Icon)`
  font-size: 16px;
  color: #333;
`;

const LocationMotionText = styled(View)`
  padding: 8px;
  padding-left: 16px;
  margin-top: -10px;
`;


