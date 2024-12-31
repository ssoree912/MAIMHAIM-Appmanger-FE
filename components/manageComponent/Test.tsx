import React from 'react';
import {View, Text, Pressable} from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Test = () => {
  const handleClose = () => {
    // Close button logic here
    console.log('Close button pressed');
  };

  return (
    <Container>
      <Card>
        <IconsContainer>
          <Icon name="car-outline" size={32} color="#3ed2cc" />
          <SpacerText>...</SpacerText>
          <Icon name="map-outline" size={32} color="#3ed2cc" />
        </IconsContainer>

        <MessageText>This page is currently in the works</MessageText>

        <CloseButton onPress={handleClose}>
          <CloseButtonText>Close</CloseButtonText>
          <CloseIcon name="close-outline" size={16} color="#333" />
        </CloseButton>
      </Card>
    </Container>
  );
};

export default Test;

// Styled Components
const Container = styled(View)`
  flex: 1;
  background-color: rgba(179, 181, 189, 0.5);
`;

const Card = styled(View)`
  width: 80%;
  background-color: #fff;
  padding: 20px;
  border-radius: 20px;
  align-items: center;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;

const IconsContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const SpacerText = styled(Text)`
  font-size: 24px;
  color: #3ed2cc;
  margin: 0 10px;
`;

const MessageText = styled(Text)`
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
`;

const CloseButton = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 10px;
`;

const CloseButtonText = styled(Text)`
  font-size: 16px;
  color: #333;
  margin-right: 8px;
`;

const CloseIcon = styled(Icon)`
  font-size: 16px;
  color: #333;
`;
