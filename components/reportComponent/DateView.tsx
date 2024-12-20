import React from 'react';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import {TouchableOpacity, Text, View} from 'react-native';
import ArrowIcon from '../../assets/defaultIcon/arrow_icon.svg';

const DateView = ({date}: {date: string}) => {
  return (
    <Container>
      <TouchableOpacity>
        <ArrowIcon transform={[{scaleX: -1}]} />
      </TouchableOpacity>
      <DateText>{date}</DateText>
      <TouchableOpacity>
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
  /* height: 48px; */
  border-radius: 15px;
  background-color: ${styles.colors.gray[100]};
  padding: 12px;
`;

const DateText = styled(Text)`
  color: ${styles.colors.gray[800]};
  font-size: 18px;
`;
