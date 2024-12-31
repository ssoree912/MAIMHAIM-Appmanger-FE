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

const AppList = ({
  apps,
}: {
      apps: {appId: number; appName: string; weeklyReport: number[]; count: number; image: string}[];
// 데이터 타입 유연성 제공
}) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const navigate = useNavigate();


       const [mockData, setMockData] = useState(() =>
         apps.map((app) => ({
           appId: app.appId,
           appName: app.appName,
           times: app.count,
           weekList: app.weeklyReport,
           image: app.image,
           isSelected: false,
         })),
       );


       useEffect(() => {
         if (!Array.isArray(apps)) {
           console.error('Invalid apps data:', apps); // apps가 배열이 아닌 경우 경고 출력
           return;
         }

         const processedData = apps.map((app) => ({
              appId: app.appId,
           appName: app.label || app.appName || 'Unknown',
           times: app.value || app.count || 0,
           image: app.image || '',
           isSelected: false,
           weekList: app.weeklyReport,
         }));
         console.log('Updated mockData on apps change:', processedData);
         setMockData(processedData);
       }, [apps]);



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
          setMockData((prevState) =>
            prevState.map((item) => ({...item, isSelected: false}))
          );
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
    }, [isLongPress]);

  return (
    <Container>
      {mockData.map((value, index) => (
        <AppItem
          key={`AppListIndex${index}`}
         appName={value.appName || 'Unknown'} // 기본값 설정
          times={value.times || 0} // 숫자 보장
           isSelected={value.isSelected || false} // 기본값 추가
          isLongPress={isLongPress}
          handleLongPress={() => handleLongPress(index)}
          handlePress={() => handlePress(index)}
          icon={value.image || ''} // 빈 문자열로 기본값 설정
          navigate={navigate}
          appId={value.appId}
          weekList={value.weekList}
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
  gap: 12px;
  display: flex;
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