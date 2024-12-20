import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {styled} from 'styled-components';
import OverviewItem from './OverviewItem';

interface overviewItemProps {
  address: string;
  times: number;
}

const OverviewList = ({appName}: {appName: string}) => {
  const data: overviewItemProps[] = [
    {
      address: '230 S. Alvarado, Los Angeles',
      times: 16,
    },
    {
      address: '639 N Broadway, Los Angeles',
      times: 16,
    },
    {
      address: '2735 S. Figueroa St., Los Angeles',
      times: 16,
    },
    {
      address: '534 S. Occidental, Los Angeles',
      times: 16,
    },
    {
      address: '3026 S Figueroa St, Los Angeles',
      times: 16,
    },
  ];

  return (
    <Container>
      {data.map((value, index) => (
        <OverviewItem
          key={`OverviewListIndex${index}`}
          appName={appName}
          address={value.address}
          times={value.times}
          index={index}
        />
      ))}
    </Container>
  );
};

export default OverviewList;

const Container = styled(View)`
  width: 100%;
  gap: 12px;
  display: flex;
`;
