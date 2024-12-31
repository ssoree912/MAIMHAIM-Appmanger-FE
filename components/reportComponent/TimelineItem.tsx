import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components';

interface TimelineItemProps {
  placeName: string;
  address: string;
  time: string;
  subTime: string;
}

const TimelineItem = ({
  placeName,
  address,
  time,
  subTime,
}: TimelineItemProps) => {
  return (
    <Container>
      <PlaceName>{placeName}</PlaceName>
      <AddressText>{address}</AddressText>
      <TimeText>{time}</TimeText>
      <TimeSubText>{subTime}</TimeSubText>
    </Container>
  );
};

export default TimelineItem;

const Container = styled(View)`
  width: 100%;
  display: flex;
  padding: 8px 0;
  background-color: white;
`;

const PlaceName = styled(Text)`
  line-height: 24px;
  font-size: 16px;
  font-weight: bold;
  color: black;
`;

const AddressText = styled(Text)`
  line-height: 16px;
  font-size: 12px;
  color: '#00000050';
`;

const TimeText = styled(Text)`
  width: 100%;
  line-height: 24px;
  font-size: 16px;
  text-align: right;
  color: black;
`;

const TimeSubText = styled(Text)`
  width: 100%;
  line-height: 16px;
  font-size: 12px;
  text-align: right;
  color: '#00000050';
`;
