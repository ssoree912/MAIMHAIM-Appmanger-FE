import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useLocation, useNavigate} from 'react-router-native';
import {Text} from '../theme/theme';
import {styles} from '../styles/styleGuide';
interface BannerTitleProps {
  isActive: boolean;
}
const BottomBanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <BottomBannerView
      isActive={location.pathname === '/'}
      style={
        {
          // shadowColor: '#000',
          // shadowOffset: {width: 0, height: 1},
          // shadowOpacity: 0.3,
          // shadowRadius: 20,
          // elevation: 3,
        }
      }>
      <BannerInner>
        <BannerItem onPress={() => navigate('/')}>
          <Icon
            name={location.pathname === '/' ? 'home' : 'home-outline'}
            size={24}
            color={
              location.pathname === '/'
                ? styles.colors.brand.primary
                : '#cdcfd0'
            }
          />
          <BannerTitle isActive={location.pathname === '/'}>홈</BannerTitle>
        </BannerItem>
        <BannerItem onPress={() => navigate('/appmanage')}>
          <Icon
            name={location.pathname === '/appmanage' ? 'grid' : 'grid'}
            size={24}
            color={
              location.pathname.startsWith('/appmanage')
                ? styles.colors.brand.primary
                : styles.colors.gray[300]
            }
          />
          <BannerTitle isActive={location.pathname.startsWith('/appmanage')}>
            앱관리
          </BannerTitle>
        </BannerItem>

        <BannerItem onPress={() => navigate('/report')}>
          <Icon
            name="pie-chart"
            size={24}
            color={
              location.pathname === '/report'
                ? styles.colors.brand.primary
                : styles.colors.gray[300]
            }
          />
          <Text style={{color: styles.colors.gray[300], fontSize: 12}}>
            리포트
          </Text>
        </BannerItem>

        <BannerItem onPress={() => navigate('/setting')}>
          <Icon
            name={location.pathname === '/setting' ? 'settings' : 'settings'}
            size={24}
            color={
              location.pathname === '/setting'
                ? styles.colors.brand.primary
                : styles.colors.gray[300]
            }
          />
          <BannerTitle isActive={location.pathname === '/setting'}>
            설정
          </BannerTitle>
        </BannerItem>
      </BannerInner>
    </BottomBannerView>
  );
};

export default BottomBanner;

const BottomBannerView = styled(View)<BannerTitleProps>`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 80px;
  border-radius: 24px 24px 0px 0px;
  background-color: #ffffff;
  justify-content: center;
  align-content: center;
  z-index: 99;
  padding: 0px 16px;
  border: 1px solid ${styles.colors.gray[100]};
`;

const BannerInner = styled(View)`
  flex-direction: row;
  width: 100%;
  justify-content: space-around;
`;
const BannerTitle = styled(Text)<BannerTitleProps>`
  font-size: 12px;
  color: ${({isActive}) =>
    isActive ? styles.colors.brand.primary : styles.colors.gray[300]};
  font-weight: ${({isActive}) => (isActive ? '600' : 'normal')};
`;
const BannerItem = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
  gap: 0px;
`;
