import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components';
import TimelineItem from './TimelineItem';

interface TimelineItemProps {
  placeName: string;
  address: string;
  time: string;
  subTime: string;
}

const TimelineList = () => {
  const mockData: TimelineItemProps[] = [
    {
      placeName: 'Seoul City Hall (City Hall Plaza)',
      address: '110 Sejong-daero, Jung-gu, Seoul, South Korea',
      time: '0hr 05min',
      subTime: '08:00 am - 08:05 am',
    },
    {
      placeName: 'Deoksugung Palace (Palace Entrance)',
      address: '99 Sejong-daero, Jung-gu, Seoul, South Korea',
      time: '0hr 10min',
      subTime: '08:10 am - 08:20 am',
    },
    {
      placeName: 'Cheonggyecheon Stream (Entrance)',
      address: '14 Sejong-daero 3-gil, Jung-gu, Seoul, South Korea',
      time: '0hr 15min',
      subTime: '08:25 am - 08:40 am',
    },
    {
      placeName: 'Jonggak Station (Exit 1)',
      address: 'Jong-ro, Jongno-gu, Seoul, South Korea',
      time: '0hr 10min',
      subTime: '08:50 am - 09:00 am',
    },
       ];

  return (
    <Container>
      {mockData.map((value, index) => (
        <TimelineItem
          placeName={value.placeName}
          address={value.address}
          time={value.time}
          subTime={value.subTime}
          key={index}
        />
      ))}
    </Container>
  );
};

export default TimelineList;

const Container = styled(View)`
  width: 100%;
  display: flex;
  gap: 1px;
  background-color: rgba(0, 0, 0, 0.5);
`;
