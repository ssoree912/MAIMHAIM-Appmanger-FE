import React from 'react';
import {Button, Touchable, TouchableOpacity, View, Text} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import AppItem from './AppItem';

interface AppItemProps {
  appName: string;
  times: number;
}

const AppList = () => {
  const data: AppItemProps[] = [
    {appName: 'Amazon Fresh', times: 18},
    {appName: 'Starbucks', times: 16},
    {appName: 'Target', times: 9},
    {appName: 'Wallmart', times: 5},
  ];

  return (
    <Container>
      {data.map((value, index) => (
        <AppItem
          key={`AppListIndex${index}`}
          appName={value.appName}
          times={value.times}
        />
      ))}
      <MoreButton>
        <MoreText>More</MoreText>
      </MoreButton>
    </Container>
  );
};

export default AppList;

const Container = styled(View)`
  width: 100%;
  /* padding: 0 21px; */
  gap: 12px;
  display: flex;
  /* flex-direction: column; */
`;

const MoreButton = styled(TouchableOpacity)`
  border: none;
  width: 100%;
  border-radius: 15px;
  background-color: ${styles.colors.gray[50]};
`;

const MoreText = styled(Text)`
  width: 100%;
  text-align: center;
  color: ${styles.colors.gray[400]};
  line-height: 52px;
  font-size: 18px;
`;
