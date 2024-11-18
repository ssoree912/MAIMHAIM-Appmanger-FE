import React, {useEffect, useRef, useState} from 'react';
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
import {MainView} from '../../components/homeComponent/HomeScreenStyle';

const HomeScreen: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const handleIsActive = () => {
    setIsActive(!isActive);
  };
  const position = useRef(new Animated.Value(isActive ? 45 : -45)).current;

  useEffect(() => {
    Animated.timing(position, {
      toValue: isActive ? 45 : -45, // right: 8 or left: 8
      duration: 500, // 1.5초
      useNativeDriver: false, // layout props로 애니메이션 적용할 때는 `false`
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
        </ContentView>
      </MainInner>
    </MainView>
  );
};

export default HomeScreen;

type isActiveBTN = {
  isActive: boolean;
};

const MainInner = styled(View)`
  gap: 54px;
`;
const TextView = styled(View)`
  justify-content: center;
  align-items: center;
`;

const ContentView = styled(View)`
  justify-content: center;
  align-items: center;
  gap: 24px;
`;
const BtnView = styled(Pressable)<isActiveBTN>`
  border-radius: 100px;
  width: 100%;
  background-color: ${({isActive}) => (isActive ? '#48CBC0' : '#eee')};
  height: 120px;
  position: relative;
  justify-content: center;
  align-items: center;
`;
const BarBtn = styled(View)<isActiveBTN>`
  width: 6px;
  background-color: #fff;
  height: 57px;
  position: absolute;
  left: 56px;
  opacity: ${({isActive}) => (isActive ? 1 : 0)};
`;
const CircleBtn = styled(Animated.View)<isActiveBTN>`
  width: 107px;
  height: 107px;
  border-radius: 100px;
  background-color: #fff;
  position: absolute;
  /* ${({isActive}) => (isActive ? 'right:8px;' : 'left:8px;')}; */
`;
