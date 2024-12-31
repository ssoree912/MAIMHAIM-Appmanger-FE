import React from 'react';
import {Text, TouchableOpacity, Image, View} from 'react-native';
import {useNavigate} from 'react-router-native';
import styled from 'styled-components/native';
import {styles} from '../../styles/styleGuide';
import Sry from '../../assets/defaultIcon/graphic_sorry'

const ComingSoonPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      {/* Images Row */}
      <IconsContainer>
        <Sry
        />
      </IconsContainer>

      <MessageText>Hang tight! {'\n'}This page is coming soon</MessageText>

      <BackButton onPress={() => navigate(-1)}>
        <BackButtonText>Return to the last page</BackButtonText>
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
  width: 164Hug;
  height: 60 Hug;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const MessageText = styled(Text)`
  font-size: 16px;
  color: ${styles.colors.gray[600]};
  textAlign: center;
  align-items: center;
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
  textAlign: center;
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
