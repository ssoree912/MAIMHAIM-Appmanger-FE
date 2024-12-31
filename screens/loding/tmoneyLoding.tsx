 import React, {useEffect, useRef, useState} from 'react';
import {Animated, Image, View, TextStyle} from 'react-native';
import {Text} from '../../theme/theme';
import styled from 'styled-components/native';
import {MainView} from '../../components/homeComponent/HomeScreenStyle';

const HomeScreen: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const handleIsActive = () => {
    setIsActive(!isActive);
  };
  const position = useRef(new Animated.Value(isActive ? 45 : -45)).current;

  useEffect(() => {
    Animated.timing(position, {
      toValue: isActive ? 45 : -45,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  return (
    <MainView>
      <MainInner>
        <ContentView>
          <Image
            source={require('../../assets/img/Logo.png')}
            style={{width: 100, height: 100}}
          />

          <TextView>
            <StyledTextContainer>
              <Text style={textStyle}>모바일 티머니</Text>
            </StyledTextContainer>
            <StyledTextContainer>
              <Text style={textStyle}>카드 잔액 확인</Text>
            </StyledTextContainer>
            <Text>기능을 불러올게요</Text>
          </TextView>

          <Image
            source={require('../../assets/img/tmoneyApp.png')}
            style={{width: 64, height: 64}}
          />
        </ContentView>
      </MainInner>
    </MainView>
  );
};

export default HomeScreen;

const MainInner = styled(View)`
  gap: 54px;
`;

const TextView = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const ContentView = styled(View)`
  justify-content: center;
  align-items: center;
  gap: 24px;
`;

const StyledTextContainer = styled(View)`
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 10px 15px;
  align-items: center;
`;

const textStyle: TextStyle = {
  fontWeight: 'bold', // 올바른 fontWeight 사용
  fontSize: 15,
};
