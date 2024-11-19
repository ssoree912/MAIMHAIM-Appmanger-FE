import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components/native';
import {
  Animated,
  Pressable,
  Text,
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  NativeModules,
  Alert,
} from 'react-native';
import { styles } from '../../styles/styleGuide';
import TimePicker from './TimePicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateTrigger } from '../../services/apiServices';

type Option = {
  name: string;
  isSelected: boolean;
};

type OptionsSwitchProps = {
  appId: number;
  triggerId: number;
  settingsOptions: Option[];
  packageName;
  onOptionSelect: (optionName: string) => void;
  selectedName: string;
  initialDays?: string[];
  initialTime?: string;
};

const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일'];
const weekendDays = ['토요일', '일요일'];

const { TimeScheduleModule} = NativeModules;

const resultDay = (selectedDays: string[]) => {
  return daysOfWeek
    .map(day => (selectedDays.includes(day) ? 'T' : 'F'))
    .join('');
};

const toggleDaysGroupSelection = (daysGroup: string[]) => {
  const updatedDays = [...new Set([...selectedDays, ...daysGroup])]; // 중복 제거
  setSelectedDays(updatedDays);
  setFormattedDay(resultDay(updatedDays));
};


const formatToServerTime = (timeString: string) => {
  const [period, hourPart, minutePart] = timeString.split(' ');
  let hour = parseInt(hourPart.replace('시', ''), 10);
  const minute = minutePart.replace('분', '').padStart(2, '0');

  if (period === '오후' && hour !== 12) hour += 12;
  else if (period === '오전' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:${minute}:00`;
};

const OptionsSwitch: React.FC<OptionsSwitchProps> = ({
  appId,
  triggerId,
  settingsOptions,
  onOptionSelect,
  packageName,
  selectedName,
  initialDays = [],
  initialTime = '',
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
const [formattedTime, setFormattedTime] = useState<string>(initialTime || '00:00:00');
  const [formattedDay, setFormattedDay] = useState(resultDay(initialDays));
const [lastSyncedTime, setLastSyncedTime] = useState<string>(initialTime || '00:00:00');
  const [lastSyncedDays, setLastSyncedDays] = useState<string>(resultDay(initialDays));
 const selectedIndex = settingsOptions.findIndex(option => option.isSelected);
  const initialPosition = selectedIndex === 0 ? 2 : 140;
  const togglePosition = useRef(new Animated.Value(initialPosition)).current;

  // 상태 초기화를 한 번만 수행
  useEffect(() => {
    if (!lastSyncedTime) {
      // lastSyncedTime이 아직 설정되지 않았을 때만 초기화
      setFormattedTime(initialTime || '00:00:00');
      setLastSyncedTime(initialTime || '00:00:00');
    } else {
      console.log('Skipping re-initialization since lastSyncedTime is set.');
    }
    setSelectedDays(initialDays || []);
    setLastSyncedDays(resultDay(initialDays || []));
  }, [initialTime, initialDays]);

   useEffect(() => {
      Animated.timing(togglePosition, {
        toValue: selectedIndex === 0 ? 2 : 140,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [selectedIndex, togglePosition]);

  const handleTimeChange = (time: string) => {
    const formatted = formatToServerTime(time);
    // 사용자가 변경한 시간만 업데이트
    if (formatted !== formattedTime) {
      setFormattedTime(formatted);
      console.log('Updated formattedTime:', formatted);
    }
  };
  const toggleDaySelection = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updatedDays);
    setFormattedDay(resultDay(updatedDays));
  };

  const saveChanges = async () => {
      if (formattedTime !== lastSyncedTime || formattedDay !== lastSyncedDays) {
        try {
          console.log('Saving to server...');
          console.log('App ID:', appId);
          console.log('Trigger ID:', triggerId);
          console.log('Formatted Time:', formattedTime);
          console.log('Formatted Day:', formattedDay);

          await updateTrigger(
            appId,
            triggerId,
            formattedTime,
            formattedDay,
            'TIME',
          )
            .then(response => {
              console.log('Server response:', response);
            })
            .catch(error => {
              console.error('Error from server:', error);
            });
          await TimeScheduleModule.setTimeSchedule(
            packageName,
            formattedDay,
            formattedTime,
          );
          setLastSyncedTime(formattedTime);
          setLastSyncedDays(formattedDay);
          console.log('Changes saved successfully.');
          Alert.alert('알림', '저장 완료되었습니다.');
        } catch (error) {
          console.error('Failed to save changes:', error);
          Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        console.log('No changes to save.');

        // 변경 사항 없음 알림
        Alert.alert('알림', '이미 저장이 되었습니다.');
      }
    };

 // 주중/주말 계산
 const determineDayDisplay = (days: string[]) => {
    const isEveryday = daysOfWeek.every(day => days.includes(day));
    const isWeekdays = weekdays.every(day => days.includes(day));
    const isWeekend = weekendDays.every(day => days.includes(day));

    if (isEveryday) return '매일';
    if (isWeekdays && days.length === weekdays.length) return '주중';
    if (isWeekend && days.length === weekendDays.length) return '주말';

    return days
      .sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
      .join(', ')
      .replace(/요일/g, ''); // "요일" 제거
  };


  return (
    <>
     <Container>
             <AnimatedSwitchButton
               style={{transform: [{translateX: togglePosition}]}}
             />
             {settingsOptions.map(option => (
               <Pressable
                 key={option.name}
                 style={{flex: 1}}
                 onPress={() => onOptionSelect(option.name)}>
                 <OptionText isSelected={option.isSelected}>
                   {option.name}
                 </OptionText>
               </Pressable>
             ))}
           </Container>


      {selectedName === '시간 기반' && (
        <>
        <TimePicker initialTime={formattedTime} onTimeChange={handleTimeChange} />

          <RepeatDaysToggle>
             <Text>요일 반복</Text>
                        <Wrap>
                          <Text>
                            {selectedDays.length
                              ? determineDayDisplay(selectedDays)
                              : '안 함'}
                          </Text>
                          <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Icon name="menu" size={20} color="#666" style={{ padding: 10 }} />
                          </TouchableOpacity>
                        </Wrap>
          </RepeatDaysToggle>

          <SaveButton onPress={saveChanges}>
            <SaveButtonText>저장</SaveButtonText>
          </SaveButton>

          <StyledModal
            transparent
            visible={isModalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}>
            <ModalBackground>
              <ModalContent>
                <ModalTitle>요일 반복</ModalTitle>
                <InnerContainer>
                  <RepeatOptions onPress={() => setSelectedDays(weekdays)}>
                    <RepeatOptionsText>주중 반복</RepeatOptionsText>
                  </RepeatOptions>
                  <RepeatOptions onPress={() => setSelectedDays(weekendDays)}>
                    <RepeatOptionsText>주말 반복</RepeatOptionsText>
                  </RepeatOptions>
                </InnerContainer>
                <FlatList
                  data={daysOfWeek}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <DayItem onPress={() => toggleDaySelection(item)}>
                      <DayText>{item}</DayText>
                      {selectedDays.includes(item) && <CheckMark>✔</CheckMark>}
                    </DayItem>
                  )}
                />
                <ConfirmButton onPress={() => setModalVisible(false)}>
                  <ConfirmButtonText>확인</ConfirmButtonText>
                </ConfirmButton>
              </ModalContent>
            </ModalBackground>
          </StyledModal>

        </>
      )}
    </>
  );
};

export default OptionsSwitch;

const SaveButton = styled.TouchableOpacity`
  background-color: #007bff;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  align-items: center;
`;

const SaveButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
`;



// Styled components
const Container = styled.View`
  flex-direction: row;
  width: 284px;
  height: 32px;
  background-color: ${styles.colors.gray[200]};
  border-radius: 10px;
  padding: 2px;
  align-items: center;
  position: relative;
`;

const AnimatedSwitchButton = styled(Animated.View)`
  position: absolute;
  width: 140px;
  height: 28px;
  background-color: #fbfbfc;
  border-radius: 10px;
`;

const OptionText = styled.Text<{isSelected: boolean}>`
  text-align: center;
  color: ${({isSelected}) => (isSelected ? '#000' : '#4f4f4f')};
  font-weight: ${({isSelected}) => (isSelected ? 'bold' : 'normal')};
`;

const RepeatDaysToggle = styled.View`
  width: 285px;
  height: 40px;
  background-color: #fff;
  border-radius: 15px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const Wrap = styled.View`
  flex-direction: row;
  align-items: center;
`;

const StyledModal = styled(Modal)``;

const ModalBackground = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
  align-items: center;
`;

const ModalContent = styled.View`
  width: 100%;
  padding: 30px;
  background-color: #f3f4f8;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  align-items: center;
`;

const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const InnerContainer = styled.View`
  flex-direction: row;
  width: 100%;
  justify-content: center;
  gap: 10px;
  margin: 20px;
`;

const RepeatOptions = styled(TouchableOpacity)`
  flex: 1;
  padding: 10px 0;
  background-color: #fff;
  border-radius: 15px;
  align-items: center;
`;

const RepeatOptionsText = styled(Text)`
  font-weight: bold;
  color: #333;
`;

const DayItem = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
  width: 100%;
  background-color: #fff;
`;

const DayText = styled.Text`
  font-size: 16px;
`;

const CheckMark = styled.Text`
  color: #00bfa5;
  font-size: 16px;
`;

const ConfirmButton = styled.TouchableOpacity`
  margin-top: 20px;
  padding: 10px 40px;
  background-color: #48cbc0;
  border-radius: 10px;
  width: 100%;
  align-items: center;
`;

const ConfirmButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;

const FormattedData = styled(TouchableOpacity)`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  border-radius: 10px;
  align-items: center;
`;

const FormattedText = styled.Text`
  color: #fff;
  font-weight: bold;
`;
