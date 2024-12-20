import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';

interface overviewItemProps {
  appName: string;
  address: string;
  times: number;
  index: number;
}

const OverviewItem = ({appName, address, times, index}: overviewItemProps) => {
  return (
    <Container>
      <Numbering>{index}</Numbering>
      <ContentSection>
        <AppName>{appName}</AppName>
        <Address>{address}</Address>
      </ContentSection>
      <TimesText>{times}</TimesText>
    </Container>
  );
};

export default OverviewItem;

const Container = styled(View)`
  width: 100%;
  padding: 11px 24px 11px 16px;
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  border-radius: 15px;
  background-color: ${styles.colors.gray[100]};
`;

const Numbering = styled(Text)`
  width: 24px;
  line-height: 24px;
  font-size: 10px;
  text-align: center;
  color: ${styles.colors.gray[600]};
`;

const ContentSection = styled(View)`
  display: flex;
  width: 100%;
`;

const AppName = styled(Text)`
  font-size: 16px;
  line-height: 24px;
  color: ${styles.colors.gray[800]};
`;

const Address = styled(Text)`
  font-size: 12px;
  line-height: 24px;
  color: ${styles.colors.gray[900]};
`;

const TimesText = styled(Text)`
  font-size: 16px;
  color: ${styles.colors.gray[500]};
`;
