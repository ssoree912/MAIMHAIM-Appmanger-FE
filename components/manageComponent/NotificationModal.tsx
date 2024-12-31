import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import * as Animatable from 'react-native-animatable';
import { styles } from '../../styles/styleGuide';

interface NotificationModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  message,
  onClose,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Overlay>
        <Animatable.View
          animation="fadeInDown"
          duration={500}
          style={styles.modalContainer}>
          <ModalContainer>
            <MessageText>{message}</MessageText>
            <CloseButton onPress={onClose}>
              <CloseButtonText>OK</CloseButtonText>
            </CloseButton>
          </ModalContainer>
        </Animatable.View>
      </Overlay>
    </Modal>
  );
};

export default NotificationModal;

const Overlay = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled(View)`
  background-color: #fff;
  width: 80%;
  padding: 20px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 10px;
  elevation: 10;
`;

const MessageText = styled(Text)`
  font-size: 16px;
  color: ${styles.colors.gray[700]};
  text-align: center;
  margin-bottom: 20px;
`;

const CloseButton = styled(TouchableOpacity)`
  background-color: ${styles.colors.brand.primary};
  padding: 10px 20px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`;

const CloseButtonText = styled(Text)`
  color: #fff;
  font-size: 16px;
  font-weight: bold;
`;

