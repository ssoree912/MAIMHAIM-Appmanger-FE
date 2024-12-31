import React from 'react';
import { Modal, Text, TouchableOpacity, Image, View } from 'react-native';
import styled from 'styled-components/native';
import { styles } from '../../styles/styleGuide';

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ visible, onClose, message }) => {
  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <Overlay>
        <ModalContainer>
          <IconsContainer>
            <StyledImage
              source={require('../../assets/img/icons/graphic_sorry.png')}
            />
          </IconsContainer>
          <MessageText>{message}</MessageText>
          <BackButton onPress={onClose}>
            <BackButtonText>Close</BackButtonText>
            <BackButtonIcon
              source={require('../../assets/img/icons/icon_squarex.png')}
            />
          </BackButton>
        </ModalContainer>
      </Overlay>
    </Modal>
  );
};

export default AlertModal;

const Overlay = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContainer = styled(View)`
  width: 300px;
  height: 200px;
  background-color: #fff;
  border-radius: 15px;
  padding: 16px;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.15);
  elevation: 5;
`;

const IconsContainer = styled(View)`
  width: 80px;
  height: 80px;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
  resize-mode: contain;
`;

const MessageText = styled(Text)`
  font-size: 14px;
  color: ${styles.colors.gray[600]};
  font-weight: 500;
  text-align: center;
  margin-bottom: 16px;
`;

const BackButton = styled(TouchableOpacity)`
  width: 80%;
  padding: 10px;
  background-color: ${styles.colors.gray[100]};
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const BackButtonText = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  color: ${styles.colors.gray[700]};
`;

const BackButtonIcon = styled(Image)`
  width: 20px;
  height: 20px;
  margin-left: 8px;
`;
