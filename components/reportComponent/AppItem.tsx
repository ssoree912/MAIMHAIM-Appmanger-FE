import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import ArrowIcon from '../../assets/defaultIcon/arrow_icon.svg';

interface AppItemProps {
  appName: string;
  times: number;
}

const AppItem = ({appName, times}: AppItemProps) => {
  return (
    <Container>
      <LeftSection>
        <Icon />
        <AppNameText>{appName}</AppNameText>
      </LeftSection>
      <RightSection>
        <TimesText>{times} times</TimesText>
        <ArrowTouchable>
          <ArrowIcon />
        </ArrowTouchable>
      </RightSection>
    </Container>
  );
};

export default AppItem;

const Container = styled(View)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 52px;
  padding: 12px 0 12px 12px;
  border-radius: 15px;
  background-color: ${styles.colors.gray[100]};
`;

const LeftSection = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightSection = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const Icon = styled(View)`
  width: 28px;
  height: 28px;
  margin-right: 16px;
  border-radius: 5px;
  background-color: ${styles.colors.gray[50]};
`;

const AppNameText = styled(Text)`
  font-size: 16px;
  font-weight: 600;
  color: ${styles.colors.gray[800]};
`;

const TimesText = styled(Text)`
  font-size: 16px;
  color: ${styles.colors.gray[500]};
`;

const ArrowTouchable = styled(TouchableOpacity)`
  padding: 10px;
`;
