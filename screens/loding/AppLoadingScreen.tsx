import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, View, TextStyle } from 'react-native';
import { Text } from '../../theme/theme';
import styled from 'styled-components/native';
import { MainView } from '../../components/homeComponent/HomeScreenStyle';

interface AppLoadingScreenProps {
  appName: string; // 앱 이름
  logoSource: any; // 로고 이미지 경로
  appIconSource: any; // 앱 아이콘 이미지 경로
  loadingMessage?: string; // 로딩 메시지
}

const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  appName,
  logoSource,
  appIconSource,
  loadingMessage = 'Just a few more Seconds',
}) => {
  const [isActive, setIsActive] = useState(true);
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
          <Image source={logoSource} style={{ width: 100, height: 100 }} />

          <TextView>
            <StyledTextContainer>
              <Text style={textStyle}>{appName}</Text>
              </StyledTextContainer>
            <StyledTextContainer>
              <Text style={textStyle}>""</Text>
            </StyledTextContainer>
            <Text>{loadingMessage}</Text>
          </TextView>

          <Image source={appIconSource} style={{ width: 64, height: 64 }} />
        </ContentView>
      </MainInner>
    </MainView>
  );
};

export default AppLoadingScreen;

// 스타일 정의
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
  fontWeight: 'bold',
  fontSize: 15,
};
