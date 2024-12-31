import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import styled from 'styled-components/native';

type TimePickerProps = {
  onTimeChange: (time: string) => void;
  initialTime: string;
};

const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange, initialTime }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);

  const periods = ['AM', 'PM'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourPickerRef = useRef<ScrollView>(null);
  const minutePickerRef = useRef<ScrollView>(null);
  const periodPickerRef = useRef<ScrollView>(null);

  // 초기값 설정
  useEffect(() => {
    if (initialTime) {
      const [hour, minute] = initialTime.split(':').map((val) => parseInt(val, 10));
      const isPM = hour >= 12;

      const newPeriod = isPM ? 'PM' : 'AM';
      const newHour = isPM ? hour - 12 || 12 : hour || 12;
      const newMinute = minute;

      if (selectedPeriod === '' && selectedHour === null && selectedMinute === null) {
        setSelectedPeriod(newPeriod);
        setSelectedHour(newHour);
        setSelectedMinute(newMinute);

        setTimeout(() => {
          if (periodPickerRef.current) {
            periodPickerRef.current.scrollTo({ y: periods.indexOf(newPeriod) * 40, animated: false });
          }
          if (hourPickerRef.current) {
            hourPickerRef.current.scrollTo({ y: (newHour - 1) * 40, animated: false });
          }
          if (minutePickerRef.current) {
            minutePickerRef.current.scrollTo({ y: newMinute * 40, animated: false });
          }
        }, 0);
      }
    }
  }, [initialTime]);

  // 변경된 시간 전달
  useEffect(() => {
    if (selectedPeriod && selectedHour !== null && selectedMinute !== null) {
      const formattedTime = `${selectedPeriod} ${selectedHour}시 ${selectedMinute
        .toString()
        .padStart(2, '0')}분`;
      onTimeChange(formattedTime);
    }
  }, [selectedPeriod, selectedHour, selectedMinute]);

  const handleScroll = (setSelected: React.Dispatch<React.SetStateAction<any>>, items: any[]) => (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 40);
    const selectedValue = items[index];
    setSelected(selectedValue);
  };

  return (
    <Wrap>
      <Container>
        <Line />
        <Picker
          ref={periodPickerRef}
          contentContainerStyle={{ paddingVertical: 80 }}
          snapToInterval={40}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll(setSelectedPeriod, periods)}
        >
          {periods.map((period) => (
            <Item key={period} isSelected={period === selectedPeriod}>
              {period}
            </Item>
          ))}
        </Picker>
        <Picker
          ref={hourPickerRef}
          contentContainerStyle={{ paddingVertical: 80 }}
          snapToInterval={40}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll(setSelectedHour, hours)}
        >
          {hours.map((hour) => (
            <Item key={hour} isSelected={hour === selectedHour}>
              {hour}
            </Item>
          ))}
        </Picker>
        <Picker
          ref={minutePickerRef}
          contentContainerStyle={{ paddingVertical: 80 }}
          snapToInterval={40}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll(setSelectedMinute, minutes)}
        >
          {minutes.map((minute) => (
            <Item key={minute} isSelected={minute === selectedMinute}>
              {minute.toString().padStart(2, '0')}
            </Item>
          ))}
        </Picker>
      </Container>
    </Wrap>
  );
};

const Wrap = styled(View)`
  width: 100%;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  border-radius: 10px;
  padding: 10px;
  position: relative;
`;

const Picker = styled(ScrollView)`
  width: 50px;
  height: 200px;
`;

const Item = styled.Text<{ isSelected: boolean }>`
  height: 40px;
  text-align: center;
  color: ${({ isSelected }) => (isSelected ? '#282A3A' : '#B3B5BD')};
  font-size: ${({ isSelected }) => (isSelected ? '16px' : '14px')};
  font-weight: ${({ isSelected }) => (isSelected ? 'bold' : 'normal')};
`;

const Line = styled(View)`
  height: 40px;
  width: 100%;
  position: absolute;
  top: 41%;
  pointer-events: none;
  border-radius: 10px;
  background-color: #fff;
`;

export default TimePicker;
