import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {styled} from 'styled-components';
import OverviewItem from './OverviewItem';

interface overviewItemProps {
  appName: string;
  address: string;
  count: number;
}


const OverviewList = ({appName, data}: {appName: string; data: overviewItemProps[]}) => {
     console.log('OverviewList received appName:', appName);
      console.log('OverviewList received data:', data);

  if (!data || data.length === 0) {
    console.warn('No data provided to OverviewList');
    return <Text>No overview data available</Text>;
  }

  return (
    <Container>
      {data.map((value, index) => (
        <OverviewItem
          key={`OverviewListIndex${index}`}
          appName={appName}
          address={value.address}
          count={value.count}
          index={index + 1} // Assigning 1-based index
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
