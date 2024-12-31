import React from 'react';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import {TouchableOpacity, Text, View} from 'react-native';
import ArrowIcon from '../../assets/defaultIcon/arrow_icon.svg';

const DateView = ({
  date,
  onPrevious,
  onNext,
}: {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  return (
    <Container>
      <TouchableOpacity onPress={onPrevious}>
        <ArrowIcon transform={[{scaleX: -1}]} />
      </TouchableOpacity>
      <DateText>{date}</DateText>
      <TouchableOpacity onPress={onNext}>
        <ArrowIcon />
      </TouchableOpacity>
    </Container>
  );
};

export default DateView;

const Container = styled(View)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  border-radius: 15px;
  background-color: ${styles.colors.gray[100]};
  padding: 12px;
`;

const DateText = styled(Text)`
  color: ${styles.colors.gray[800]};
  font-size: 18px;
`;
