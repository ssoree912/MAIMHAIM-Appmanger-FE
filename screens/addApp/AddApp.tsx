import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  View,
  Alert,
  NativeModules,
} from 'react-native';
import { Text } from '../../theme/theme';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigate } from 'react-router-native';
import { useRecoilState } from 'recoil';
import { AddApplication, AddApplicationToggle, AllApplicationToggle } from '../../atom/atom';
import { getAppsToAdd, addApp } from '../../services/apiServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../../utils/DatabaseService';
import NotificationModal from '../../components/manageComponent/NotificationModal'; // 알림창 컴포넌트


const AddApp = () => {
  const [addAppList, setAddAppList] = useRecoilState(AddApplication);
  const [toggleStates, setToggleStates] = useRecoilState(AddApplicationToggle);
  const [isAllTrue, setIsAllTrue] = useRecoilState(AllApplicationToggle);
  const [apps, setApps] = useState([]);
  const navigate = useNavigate();
  const {ForegroundService, MemberIdModule, LeaveHandleModule, ActivateModule} =
    NativeModules;
  const [modalVisible, setModalVisible] = useState(false); // 알림창 상태
  const [notificationMessage, setNotificationMessage] = useState(''); // 알림 메시지


  useEffect(() => {
    const fetchApps = async () => {
      try {
        const memberId = await AsyncStorage.getItem('memberId');
        console.log('Fetched Member ID:', memberId);  // Member ID 확인

        if (memberId) {
          await MemberIdModule.saveMemberId(memberId);
          const response = await getAppsToAdd(parseInt(memberId, 10));
          console.log('Fetched Apps Response:', response);

          if (response?.data?.data) {
            setApps(response.data.data);
            setToggleStates(response.data.data.map(app => app.add));
          } else {
            console.warn('No data in response.data.data');
          }
        } else {
          console.warn('Member ID is null or undefined.');
        }
      } catch (error) {
        console.error('Error in fetchApps:', error);
      }
    };
    fetchApps();
  }, []);

  const showNotification = (message) => {
      setNotificationMessage(message);
      setModalVisible(true);
    };


  const handleToggle = async (index) => {
    const newToggleStates = [...toggleStates];
    const selectedApp = apps[index];
    const memberId = await AsyncStorage.getItem('memberId');

    if (memberId) {
      if (newToggleStates[index]) {
        // 앱 제거
        newToggleStates[index] = false; // 상태 반전
        try {
          await addApp(parseInt(memberId, 10), [{ appId: selectedApp.appId, add: false }]); // 서버에 제거 요청
          await DatabaseService.updateAppIsAdd(selectedApp.packageName, false); // 로컬 DB에서 isAdd를 0으로 업데이트
          console.log(selectedApp.ssid);
          await LeaveHandleModule.leaveApp(selectedApp.ssid, false);
          showNotification(`${selectedApp.name} has been removed.`);
        } catch (error) {
          console.error('Error removing app:', error);
         showNotification('There was an issue removing the app. Please try again.');
        }
      } else {
        // 앱 추가
        newToggleStates[index] = true; // 상태 반전
        try {
          await addApp(parseInt(memberId, 10), [{ appId: selectedApp.appId, add: true }]); // 서버에 추가 요청
          await DatabaseService.updateAppIsAdd(selectedApp.packageName, true); // 로컬 DB에서 isAdd를 1로 업데이트
          showNotification(`${selectedApp.name} has been added.`);
        } catch (error) {
          console.error('Error adding app:', error);
          showNotification('There was an issue adding the app. Please try again.');
        }
      }
    }

    setToggleStates(newToggleStates); // 토글 상태 업데이트

    // Update addApp state with selected apps
    const updatedSelectedItems = newToggleStates.reduce((acc, curr, i) => {
      if (curr) {
        acc.push(apps[i]);
      }
      return acc;
    }, []);
    setAddAppList(updatedSelectedItems); // 업데이트된 앱 리스트
  };

  const handleAllToggle = async () => {
    // 현재 모든 앱이 1이면 0으로, 0이면 1로 변경할 새로운 상태 설정
    const newToggleState = !isAllTrue;
    const updatedToggleStates = toggleStates.map(() => newToggleState);
    setToggleStates(updatedToggleStates);
    setIsAllTrue(newToggleState);

    const memberId = await AsyncStorage.getItem('memberId');
    if (memberId) {
      const appsToAdd = apps.map(app => ({ appId: app.appId, add: newToggleState }));
      try {
        // 서버에 모든 앱의 isAdd 상태를 업데이트 요청
        await addApp(parseInt(memberId, 10), appsToAdd);
        showNotification('All app statuses have been updated.');
        const packageNames = apps.map(app => app.packageName);
        await ActivateModule.activateAddApp(packageNames, newToggleState);
        // 로컬 데이터베이스에 모든 앱의 isAdd 상태 업데이트
        // for (const app of apps) {
        //   // await DatabaseService.updateAppIsAdd(app.packageName, newToggleState);
        //   await ActivateModule.activateAddApp(app.packageName,newToggleState);
        // }
        console.log('Local database updated for all apps');
      } catch (error) {
        console.error('Error adding all apps:', error);
        showNotification('There was an issue updating app statuses.');
      }
    }

    // addApp 상태 업데이트
    setAddApp(newToggleState ? apps : []); // 모든 앱 추가/제거
  };



  return (
    <AppManageView>
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 64,
          marginLeft: 20,
        }}
        onPress={() => navigate(-1)}>
        <Icon name="chevron-back" size={24} color="#000" />
      </Pressable>
      <ManageContentView>
        <TopContentView>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}> Edit App List</Text>
        </TopContentView>
        <ContentView>
          <AllSelectView>
            <Text style={{left: -146,fontSize: 12, color: '#9496A1'}}>
                    App Name
            </Text>
            <Select onPress={handleAllToggle}>
              <Text style={{ fontSize: 12, color: '#9496A1' }}>Select All</Text>
              <Icon
                name={isAllTrue ? 'checkbox' : 'checkbox-outline'}
                size={20}
                color={isAllTrue ? '#48CBC0' : '#9496A1'}
              />
            </Select>
          </AllSelectView>
          {apps.map((item, index) => (
            <SelectView key={item.appId}>
              <ItemFirstView>
                <Img source={{ uri: item.image }} />
                <Text style={{ fontSize: 16 }}>
                  {item.name}
                </Text>
              </ItemFirstView>
              <SelectIcon
                onPress={() => handleToggle(index)}
                isActive={toggleStates[index]}>
                <Icon
                  name={toggleStates[index] ? 'checkbox' : 'checkbox-outline'}
                  size={20}
                  color={toggleStates[index] ? '#48CBC0' : '#9496A1'}
                />
              </SelectIcon>
            </SelectView>
          ))}
        </ContentView>
      </ManageContentView>

      <NotificationModal
        visible={modalVisible}
        message={notificationMessage}
        onClose={() => setModalVisible(false)}
      />

    </AppManageView>
  );
};

export default AddApp;

// Styled components...

const AppManageView = styled(ScrollView)`
  background: #fff;
  height: 100%;
`;
const ManageContentView = styled(View)`
  gap: 18px;
  margin-bottom: 200px;
`;
const TopContentView = styled(View)`
   left: 134px;
   top: -25px;
  `;
const ContentView = styled(View)``;
const AllSelectView = styled(View)`
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  padding: 15px 30px;
  margin-top: 0px;
  border-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: #F3F4F8;
`;
const Select = styled(Pressable)`
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
`;
const SelectView = styled(View)`
  padding: 15px 30px;
  border-style: solid;
  border-bottom-width: 1px;
  border-bottom-color: #F3F4F8;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const Img = styled(Image)`
  width: 44px;
  height: 44px;
  border: 1px solid #D2D4DA;
  border-radius: 8px;

`;
const ItemFirstView = styled(View)`
  flex-direction: row;
  gap: 14px;
  align-items: center;
`;
const SelectIcon = styled(Pressable)<{ isActive?: boolean }>`
`;