import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import {View, Pressable, Text, Modal, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import ShortSwitch from '../switch/ShortSwitch';
import OptionsSwitch from '../switch/OptionsSwitch';
import {styles} from '../../styles/styleGuide';

type Option = {
  name: string;
  isSelected: boolean;
};

type ItemProps = {
  item: {
    id: string;
    name: string;
    icon: string;
    color: string;
    toggle: boolean;
    allowed: boolean;
    settingsOptions: Option[];
  };
};

type CustomLayoutProps = {
  onOpenModal: () => void; // 모달 열기 핸들러를 props로 전달
};

const CustomLayout: React.FC<ItemProps> = ({item}) => {
  const [toggle, setToggle] = useState(item.toggle);
  const [allowed, setAllowed] = useState(item.allowed);
  const [settingsOptions, setSettingsOptions] = useState(item.settingsOptions);
  const [modalVisible, setModalVisible] = useState(false);

  const onIconPress = () => {
    setToggle(!toggle);
    console.log('onIconPress');
    console.log(item);
  };

  const onAllowedPress = () => {
    setAllowed(!allowed);
  };

  const onOptionSelect = (optionName: string) => {
    setSettingsOptions(prevOptions =>
      prevOptions.map(option =>
        option.name === optionName
          ? {...option, isSelected: true}
          : {...option, isSelected: false},
      ),
    );
  };

  const CustomLayout: React.FC<ItemProps & CustomLayoutProps> = ({ item, onOpenModal }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpenModal = () => {
      setModalVisible(true);
      onOpenModal?.(); // 부모에서 전달받은 핸들러 호출
    };

    return (
      <>
      <FeatureContainer>
        <FeatureTop>
          <ItemText allowed={allowed}>{item.name}</ItemText>
          <ShortSwitch allowed={allowed} onAllowedPress={onAllowedPress} />
          <Pressable
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            onPress={() => {
              onIconPress();
            }}>
            <Icon
              name={toggle ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#000"
            />
          </Pressable>
        </FeatureTop>
        {toggle && (
          <>
            <FeatureBottom>
              <OptionsSwitch
                settingsOptions={settingsOptions}
                onOptionSelect={onOptionSelect}
              />
            </FeatureBottom>
          </>
        )}
        <FeatureRight>
          <Tag color={item.color!} toggle={toggle}>
            <Icon name={item.icon!} size={24} color="#fff" />
          </Tag>
        </FeatureRight>
      </FeatureContainer>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <ModalContainer>
          <ModalInner>
            <IconsContainer>
              <StyledImage
                source={require('../../assets/img/icons/graphic_sorry.png')}
              />
            </IconsContainer>

            <MessageText>This page is currently in the works</MessageText>

            <BackButton>
              <BackButtonText>Close</BackButtonText>
              <Pressable onPress={() => setModalVisible(false)}>
                <BackButtonIcon
                  source={require('../../assets/img/icons/icon_squarex.png')}
                />
              </Pressable>
            </BackButton>
          </ModalInner>
        </ModalContainer>
      </Modal>
    </>
  );
};

export default CustomLayout;

const FeatureContainer = styled(View)`
  width: 100%;
  position: relative;
  margin: 8px 0;
  background-color: ${styles.colors.gray[100]};
  border-radius: 15px;
`;

const FeatureTop = styled(View)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  height: 60px;
  margin-right: 32px;
`;

const Tag = styled(View)<{color: string; toggle: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: ${({toggle}) => (toggle ? '120px' : '60px')};
  background-color: ${({color}) => `#${color}`};
  border-radius: 15px 15px 15px 0;
`;

const ItemText = styled(Text)<{allowed: boolean}>`
  color: ${({allowed}) =>
    allowed ? styles.colors.gray[800] : styles.colors.gray[400]};
  font-weight: ${({allowed}) => (allowed ? 500 : 'normal')};
  padding-left: 16px;
  flex: 2;
  font-size: 16px;
`;

const FeatureBottom = styled(View)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 32px;
`;

const FeatureRight = styled(View)`
  width: 32px;
  height: 60px;
  position: absolute;
  border-radius: 0px 15px 15px 0px;
  top: 0;
  right: 0;
`;

const ModalContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(179, 181, 189, 0.5);
`;

const ModalInner = styled(View)`
  justify-content: center;
  align-items: center;
  width: 352px;
  height: 200px;
  background-color: #fff;
  border-radius: 20px;
  padding: 20px;
`;

const IconsContainer = styled(View)`
  width: 180px;
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

const BackButton = styled(View)`
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
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const BackButtonIcon = styled(Image)`
  width: 24px;
  height: 24px;
`;

const LocationBox = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${styles.colors.gray[100]};
  padding: 12px;
  border-radius: 10px;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const LocationText = styled(Text)`
  font-size: 14px;
  color: #333;
  margin-left: 10px;
`;

const EditButton = styled(Pressable)`
  padding: 4px;
`;
