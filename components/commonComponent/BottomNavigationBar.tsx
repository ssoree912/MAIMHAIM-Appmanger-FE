import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import ChartIcon from '../../assets/defaultIcon/chart_icon.svg';
import HomeIcon from '../../assets/defaultIcon/home_icon.svg';
import ManageAppsIcon from '../../assets/defaultIcon/manage_apps_icon.svg';
import SettingIcon from '../../assets/defaultIcon/setting_icon.svg';
import {useLocation, useNavigate} from 'react-router-native';

const BottomNavigationBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const checkColor = (path: string) =>
    location.pathname === path
      ? '#48CBC0'
      : styles.colors.gray[200];

  return (
    <Container>
      <Item onPress={() => navigate('/')}>
        <HomeIcon color={checkColor('/')} />
        <ItemText $selected={location.pathname === '/'}>Main</ItemText>
      </Item>
      <Item onPress={() => navigate('/appmanage')}>
        <ManageAppsIcon color={checkColor('/appmanage')} />
        <ItemText $selected={location.pathname === '/appmanage'}>
          Manage
        </ItemText>
      </Item>
      <Item onPress={() => navigate('/report')}>
        <ChartIcon color={checkColor('/report')} />
        <ItemText $selected={location.pathname === '/report'}>Report</ItemText>
      </Item>
      <Item onPress={() => navigate('/setting')}>
        <SettingIcon color={checkColor('/setting')} />
        <ItemText $selected={location.pathname === '/setting'}>
          Settings
        </ItemText>
      </Item>
    </Container>
  );
};

export default BottomNavigationBar;

const Container = styled(View)`
  position: absolute;
  height: 80px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 60px 9px 60px;
  border: 1px solid ${styles.colors.gray[100]};
  z-index: 99;
  background-color: #fff;
  bottom: 0;
`;

const Item = styled(TouchableOpacity)`
  height: 100%;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemText = styled(Text)<{$selected: boolean}>`
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${props =>
    props.$selected ? '#48CBC0' : '#B3B5BD'};
`;
