import React, {useRef, useEffect} from 'react';
import styled from 'styled-components/native';
import {Pressable, Animated} from 'react-native';

type ShortSwitchProps = {
  allowed: boolean;
  onAllowedPress: () => void;
};

const ShortSwitch: React.FC<ShortSwitchProps> = ({allowed, onAllowedPress}) => {
  const togglePosition = useRef(new Animated.Value(allowed ? 25 : 2)).current;

  useEffect(() => {
    Animated.timing(togglePosition, {
      toValue: allowed ? 25 : 2,
      duration: 200,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  return (
    <SwitchContainer onPress={onAllowedPress} toggle={allowed}>
      <SwitchButton style={{left: togglePosition}} />
    </SwitchContainer>
  );
};

export default ShortSwitch;

const SwitchContainer = styled(Pressable)<{toggle: boolean}>`
  width: 55px;
  height: 32px;
  border-radius: 1000px;
  background-color: ${({toggle}) => (toggle ? '#5be2c3' : '#d3d3d3')};
  justify-content: center;
`;

const SwitchButton = styled(Animated.View)`
  width: 28px;
  height: 28px;
  border-radius: 1000px;
  background-color: #fff;
  position: absolute;
`;
