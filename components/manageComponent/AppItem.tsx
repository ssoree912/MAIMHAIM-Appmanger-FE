import React, { act, useEffect , useState } from 'react';
import {Image, Pressable, View, Alert, NativeModules} from 'react-native';
import { Text } from '../../theme/theme';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRecoilState } from 'recoil';
import { AddApplication, ManageApplicationToggle } from '../../atom/atom';
import { useNavigate } from 'react-router-native';
import { activateApp } from '../../services/apiServices'; // API 함수 임포트
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import DatabaseService from '../../utils/DatabaseService';
import NotificationModal from '../../components/manageComponent/NotificationModal'; // NotificationModal 임포트

export const AppItem = ({ apps, searchTerm }: any) => {
    const [toggleStates, setToggleStates] = useRecoilState(ManageApplicationToggle);
    const navigate = useNavigate();
    const [addApp] = useRecoilState(AddApplication);
    const {LeaveHandleModule} = NativeModules;
     const [modalVisible, setModalVisible] = useState(false);
        const [modalMessage, setModalMessage] = useState('');

  // 앱이 렌더링될 때 활성화 상태 초기화
  useEffect(() => {
    if (apps) {
      const initialToggleStates = apps.reduce((acc, category) => {
        category.apps.forEach((app) => {
          acc[app.appId] = app.activate;
        });
        return acc;
      }, {});
      setToggleStates(initialToggleStates);
    }
  }, [apps]);

  // handleToggle 함수 수정
   const handleToggle = async (appId, packageName, ssid) => {
          const newToggleStates = { ...toggleStates, [appId]: !toggleStates[appId] };
          setToggleStates(newToggleStates);

          const memberId = await AsyncStorage.getItem('memberId');
          if (memberId) {
            const activate = newToggleStates[appId];
            
              try {
                  await activateApp(parseInt(memberId, 10), appId, activate);
                  setModalMessage(`${activate ? 'Activated.' : 'Deactivated.'}`);
                setModalVisible(true);
                let isActivate = activate ? 1 : 0;
                  await DatabaseService.updateAppDetails(packageName, { activate });
                  // if (!activate) await LeaveHandleModule.leaveApp(ssid, activate);
                  console.log(`Local database updated for package: ${packageName}`);
              } catch (error) {
                  console.error('Error toggling app activation:', error);
                  setModalMessage("There was an issue changing the app's activation status.");
                  setModalVisible(true);
              }
          }
      };


  return (
    <>
     <NotificationModal
                    visible={modalVisible}
                    message={modalMessage}
                    onClose={() => setModalVisible(false)}
                />

      {apps.map((category) => (
        <View key={category.categoryId}>
          <CategoryTitle>{category.categoryName}</CategoryTitle>
          {category.apps.map((item) => {
            if (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              return (
                <ItemList key={item.appId}>
                  <ItemInner>
                    <ImgNameView>
                      <LogoImage source={{ uri: item.image }} />
                      <Text style={{ fontWeight: 'medium', fontSize: 16 }}>{item.name}</Text>
                    </ImgNameView>
                    <IconView>
                      <ToggleBtn onPress={() => handleToggle(item.appId, item.packageName, item.ssid)} isActive={toggleStates[item.appId]}>
                        <CircleBtn isActive={toggleStates[item.appId]} />
                      </ToggleBtn>
                      <Pressable onPress={() => navigate(`/appmanage/${item.appId}`)}>
                        <Icon name="chevron-forward" size={24} color="#000" />
                      </Pressable>
                    </IconView>
                  </ItemInner>
                </ItemList>
              );
            }
            return null;
          })}
        </View>
      ))}
    </>
  );
};

// Styled components

const ItemList = styled(View)`
  gap: 6px;
  margin-bottom: 8px;
`;

const LogoImage = styled(Image)`
  width: 64px;
  height: 64px;
  border: 1px solid #D2D4DA;
  border-radius: 12px;
`;

const ItemInner = styled(View)`
  flex-direction: row;
  border-radius: 13px;
  background: #F3F4F8;
  padding: 15px 20px;
  justify-content: space-between;
  align-items: center;
`;

const ImgNameView = styled(View)`
  gap: 12px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const IconView = styled(View)`
  flex-direction: row;
  gap: 7px;
  align-items: center;
`;

const ToggleBtn = styled(Pressable)<{ isActive?: boolean }>`
  width: 55px;
  background-color: ${({ isActive }) => (isActive ? '#48CBC0' : '#D2D4DA')};
  height: 32px;
  border-radius: 50px;
  position: relative;
  justify-content: center;
`;

const CircleBtn = styled(View)<{ isActive?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 100px;
  background: #fff;
  position: absolute;
  ${({ isActive }) => (isActive ? 'right: 3px;' : 'left: 3px;')}
`;

const CategoryTitle = styled(Text)`
  font-weight: bold;
  font-size: 14px;
  margin: 10px 0;
  color : #9496A1;
`;
