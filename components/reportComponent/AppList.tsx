import React, {useEffect, useState} from 'react';
import {
  Button,
  Touchable,
  TouchableOpacity,
  View,
  Text,
  BackHandler,
} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import AppItem from './AppItem';
import {useNavigate} from 'react-router-native';

interface AppItemProps {
  appName: string;
  times: number;
  isSelected: boolean;
}

const AppList = () => {
  const [isLongPress, setIsLongPress] = useState(false);
  const navigate = useNavigate();

  const data: AppItemProps[] = [
    {appName: 'Amazon Fresh', times: 18, isSelected: false},
    {appName: 'Starbucks', times: 16, isSelected: false},
    {appName: 'Target', times: 9, isSelected: false},
    {appName: 'Wallmart', times: 5, isSelected: false},
  ];

  const [mockData, setMockData] = useState(data);

  const changeSelectedState = (index: number) => {
    setMockData(prevState =>
      prevState.map((item, i) =>
        i === index ? {...item, isSelected: !item.isSelected} : item,
      ),
    );
  };

  const handlePress = (index: number) => {
    if (isLongPress) {
      changeSelectedState(index);
    }
  };

  const handleLongPress = (index: number) => {
    if (!isLongPress) {
      changeSelectedState(index);
      setIsLongPress(true);
    } else {
      changeSelectedState(index);
    }
  };

  useEffect(() => {
    const handleBackButton = () => {
      if (isLongPress) {
        data.forEach(value => (value.isSelected = false));
        setIsLongPress(false);
      } else {
        navigate(-1);
      }
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);

  return (
    <Container>
      {mockData.map((value, index) => (
        <AppItem
          key={`AppListIndex${index}`}
          appName={value.appName}
          times={value.times}
          isSelected={value.isSelected}
          isLongPress={isLongPress}
          handleLongPress={() => handleLongPress(index)}
          handlePress={() => handlePress(index)}
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
