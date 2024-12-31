import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import ArrowIcon from '../../assets/defaultIcon/arrow_icon.svg';
import {useNavigate} from 'react-router-native';

const DetailHeader = ({headerTitle}: {headerTitle: string}) => {
  const navigate = useNavigate();

  return (
    <Container>
      <BackButton onPress={() => navigate(-1)}>
        <ArrowIcon transform={[{scaleX: -1}]} />
      </BackButton>
      <HeaderText>{headerTitle}</HeaderText>
      <View style={{width: 44}} />
    </Container>
  );
};

export default DetailHeader;

const Container = styled(View)`
  padding: 16px 10px 10px 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled(TouchableOpacity)`
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: ${styles.colors.gray[800]};
`;
