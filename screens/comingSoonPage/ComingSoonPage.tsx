import React from 'react';
import {Text, TouchableOpacity, Image, View} from 'react-native';
import {useNavigate} from 'react-router-native';
import styled from 'styled-components/native';
import {styles} from '../../styles/styleGuide';

const ComingSoonPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Images Row */}
      <IconsContainer>
        <StyledImage
          source={require('../../assets/img/icons/graphic_sorry.png')}
        />
      </IconsContainer>

      <MessageText>해당 페이지는 준비 중이에요!</MessageText>

      <BackButton onPress={() => navigate(-1)}>
        <BackButtonText>이전 화면으로 돌아가기</BackButtonText>
        <BackButtonIcon
          source={require('../../assets/img/icons/icon_back.png')}
        />
      </BackButton>
    </Container>
  );
};

export default ComingSoonPage;

// Styled Components
const Container = styled(View)`
  flex: 1;
  padding: 0 20px;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

const IconsContainer = styled(View)`
  width: 200px;
  height: 60px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const MessageText = styled(Text)`
  font-size: 16px;
  color: ${styles.colors.gray[600]};
  font-weight: 500;
  margin-bottom: 20px;
`;

const BackButton = styled(TouchableOpacity)`
  width: 100%;
  background-color: ${styles.colors.gray[100]};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 20px;
  gap: 6px;
`;

const BackButtonText = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  color: ${styles.colors.gray[600]};
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const BackButtonIcon = styled(Image)`
  width: 24px;
  height: 24px;
`;
