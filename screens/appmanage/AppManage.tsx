import React, { useEffect, useState } from 'react';
import { Text } from '../../theme/theme';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppItem } from '../../components/manageComponent/AppItem';
import { getApps, getAppsToAdd } from '../../services/apiServices'; // API 서비스
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트
import { useNavigate } from 'react-router-native'; // useNavigate 임포트
import { AddApplication } from '../../atom/atom'; // AddApplication import
import { useRecoilState } from 'recoil'; // Recoil state import

const AppManage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [apps, setApps] = useState([]); // 앱 리스트 상태
  const navigate = useNavigate(); // navigate 초기화
  const [activationStates, setActivationStates] = useState([]); // 활성화 상태
  const [addApp, setAddApp] = useRecoilState(AddApplication); // 앱 추가 상태

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const memberId = await AsyncStorage.getItem('memberId');
        if (memberId) {
          // 카테고리 정보 가져오기
          const categoryResponse = await getApps(parseInt(memberId, 10), true);
          if (categoryResponse.data && categoryResponse.data.data) {
            setApps(categoryResponse.data.data); // 카테고리 앱 데이터 저장
          }

          // 추가 정보 가져오기 (활성화 상태)
          const addResponse = await getAppsToAdd(parseInt(memberId, 10));
          if (addResponse.data && addResponse.data.data) {
            const initialToggleStates = addResponse.data.data.map(app => app.activate);
            setActivationStates(initialToggleStates); // 활성화 상태 저장
            setAddApp(addResponse.data.data); // 앱 추가 상태 업데이트
          }
        }
      } catch (error) {
        console.error('Failed to fetch apps', error);
      }
    };

    fetchApps();
  }, []);

  return (
    <AppManageView>
      <ManageContentView>
        <Text style={{ fontWeight: 'bold', fontSize: 32 }}>Manage Apps</Text>
        <TopContentView>
          <TextView>
            <SearchIcon name="search" size={20} color="#B3B5BD" />
            <SearchInput
              placeholder="Find an app"
              placeholderTextColor="#B3B5BD"
              value={searchTerm}
              onChangeText={text => setSearchTerm(text)}
            />
          </TextView>
          <AddView>
            <AddViewContent onPress={() => navigate('/appmanage/addapp')}>
              <Icon name="add-circle" size={24} color="#9496a1" />
              <Text style={{ color: '#9496A1' }}>Edit app list</Text>
            </AddViewContent>
          </AddView>
        </TopContentView>

        {/* AppItem 컴포넌트에 검색어와 앱 리스트를 전달 */}
        <AppItem apps={apps} activationStates={activationStates} searchTerm={searchTerm} addApp={addApp} />
      </ManageContentView>
    </AppManageView>

  );
};

export default AppManage;

const AppManageView = styled(ScrollView)`
  background: #fff;
  padding: 59px 20px;
  height: 100%;
`;

const ManageContentView = styled(View)`
  gap: 18px;
  margin-bottom: 200px;
`;

const TextView = styled(View)`
  position: relative;
  justify-content: center;
  align-items: center;
`;

const SearchInput = styled(TextInput)`
  width: 100%;
  padding: 5px;
  background: #F3F4F8;
  border-radius: 100px;
  padding-left: 44px;
  color: #000;
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  z-index: 2;
  left: 16px;
`;

const AddView = styled(Pressable)`
  width: 100%;
  border: 2px dashed #cdcfd0;
  border-radius: 13px;
  padding: 18px;
`;

const AddViewContent = styled(Pressable)`
  flex-direction: row;
  justify-content: center;
  align-content: center;
  gap: 13px;
`;

const TopContentView = styled(View)`
  gap: 27px;
`;