import styled from 'styled-components/native';
import {Animated, Dimensions, View, Text} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {styles} from '../../styles/styleGuide';
import React from 'react';

interface StyleTabProps {
  menus: string[];
  setIndex: (i: number) => void;
  index: number;
}

const StyleTab = ({menus, setIndex, index}: StyleTabProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const PADDING = 2;
  const tabWidth = containerWidth
    ? (containerWidth - PADDING * 2) / menus.length
    : 0;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    translateX.setValue(index * tabWidth);
  }, [tabWidth]);

  const handleSelect = (i: number) => {
    setIndex(i);

    Animated.timing(translateX, {
      toValue: i * tabWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TabContainer
      onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}>
      <SelectedTab $tabWidth={tabWidth} style={{transform: [{translateX}]}} />
      {menus.map((value, i) => (
        <Tab key={`styleTab${i}`} onPress={() => handleSelect(i)}>
          {value}
        </Tab>
      ))}
    </TabContainer>
  );
};

const TabContainer = styled(View)`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 2px;
  background-color: ${styles.colors.gray[200]};
  border-radius: 9px;
  position: relative;
`;

const Tab = styled(Text)`
  font-size: 14px;
  color: ${styles.colors.gray[800]};
  flex: 1;
  text-align: center;
  padding: 8px 0;
`;

const SelectedTab = styled(Animated.View)<{$tabWidth: number}>`
  position: absolute;
  width: ${props => `${props.$tabWidth}px`};
  background-color: ${styles.colors.gray[50]};
  border-radius: 9px;
  height: 100%;
  margin: 2px;
`;

export default StyleTab;
