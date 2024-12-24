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
      placeName: '"Place Name" ("street 1"&"Street 2)',
      address: '"Address"',
      time: '0hr 00min',
      subTime: '00:00 am - 00:00 pm',
    },
    {
      placeName: '"Place Name" ("street 1"&"Street 2)',
      address: '"Address"',
      time: '0hr 00min',
      subTime: '00:00 am - 00:00 pm',
    },
    {
      placeName: '"Place Name" ("street 1"&"Street 2)',
      address: '"Address"',
      time: '0hr 00min',
      subTime: '00:00 am - 00:00 pm',
    },
    {
      placeName: '"Place Name" ("street 1"&"Street 2)',
      address: '"Address"',
      time: '0hr 00min',
      subTime: '00:00 am - 00:00 pm',
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
