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
import {AppItemType} from '../../interface/interface';

interface AppListProps {
  apps: AppItemType[];
  styleIndex: number;
  setAppId: React.Dispatch<React.SetStateAction<number | null>>;
  appId: number | null;
}

const AppList = ({apps, styleIndex, setAppId, appId}: AppListProps) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const [enabledPress, setEnabledPress] = useState(false);
  const navigate = useNavigate();

  // COMMENT: 중복선택이 안된다고 해서 appId를 가지고 선택된건지, 안된건지를 체크하는 로직으로 변경이 되었습니다. 그래서 아래 코드가 필요 없어졌지만, 다시 사용하실수도 있으니 주석처리만 해두었습니다. 필요없다면 삭제하셔도 무관합니다.

  // const [mockData, setMockData] = useState(() =>
  //   apps.map(app => ({
  //     appId: app.appId,
  //     appName: app.appName,
  //     times: app.count,
  //     weekList: app.weeklyReport,
  //     image: app.image,
  //     isSelected: false,
  //   })),
  // );

  // useEffect(() => {
  //   if (!Array.isArray(apps)) {
  //     console.error('Invalid apps data:', apps); // apps가 배열이 아닌 경우 경고 출력
  //     return;
  //   }

  //   const processedData = apps.map(app => ({
  //     appId: app.appId,
  //     appName: app.label || app.appName || 'Unknown',
  //     times: app.value || app.count || 0,
  //     image: app.image || '',
  //     isSelected: false,
  //     weekList: app.weeklyReport,
  //   }));
  //   console.log('Updated mockData on apps change:', processedData);
  //   setMockData(processedData);
  // }, [apps]);

  useEffect(() => {
    if (styleIndex !== 1) {
      setIsLongPress(false);
      setEnabledPress(false);
      setAppId(null);
    } else {
      setEnabledPress(true);
    }
  }, [styleIndex]);

  const handlePress = (index: number) => {
    if (isLongPress) {
      setAppId(index);
    }
  };

  const handleLongPress = (index: number) => {
    if (enabledPress) {
      setAppId(index);
      if (!isLongPress) {
        setIsLongPress(true);
      }
    }
  };

  useEffect(() => {
    const handleBackButton = () => {
      if (isLongPress) {
        setIsLongPress(false);
        setAppId(null);
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
      {apps.map((value, index) => (
        <AppItem
          key={`AppListIndex${index}`}
          appName={value.appName || 'Unknown'} // 기본값 설정
          times={value.count || 0} // 숫자 보장
          isSelected={appId === value.appId || false} // 기본값 추가
          isLongPress={isLongPress}
          handleLongPress={() => handleLongPress(value.appId)}
          handlePress={() => handlePress(value.appId)}
          icon={value.image || ''} // 빈 문자열로 기본값 설정
          navigate={navigate}
          appId={value.appId}
          weekList={value.weeklyReport}
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
