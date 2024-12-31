import React from 'react';
import {View, Text} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';

interface overviewItemProps {
  appName: string;
  address: string;
  count: number;
  index: number;
}

const OverviewItem = ({appName, address, count, index}: overviewItemProps) => {
  console.log('Rendering OverviewItem:', {appName, address, count, index});
  console.log('CountText value:', count);

  return (
    <Container>
      <LeftSection>
        <Numbering>{index}</Numbering>
        <ContentSection>
          <AppName numberOfLines={1} ellipsizeMode="tail">{appName}</AppName>
          <Address numberOfLines={1} ellipsizeMode="tail">{address}</Address>
        </ContentSection>
      </LeftSection>
      <RightSection>
        <CountText>{`${count} times`}</CountText>
      </RightSection>
    </Container>
  );
};

export default OverviewItem;

const Container = styled(View)`
  width: 100%;
  padding: 11px 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  background-color: ${styles.colors.gray[100]};
`;

const LeftSection = styled(View)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const Numbering = styled(Text)`
  width: 24px;
  line-height: 24px;
  font-size: 10px;
  text-align: center;
  color: ${styles.colors.gray[900]};
`;

const ContentSection = styled(View)`
  display: flex;
  flex: 1;
  gap: 4px;
  overflow: hidden; /* Ensures no overflow from content */
`;

const AppName = styled(Text)`
  font-size: 16px;
  line-height: 24px;
  color: ${styles.colors.gray[800]};
  flex-shrink: 1; /* Prevents AppName from expanding uncontrollably */
`;

const Address = styled(Text)`
  font-size: 12px;
  line-height: 24px;
  color: ${styles.colors.gray[900]};
  flex-shrink: 1;
`;

const RightSection = styled(View)`
  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

const CountText = styled(Text)`
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-align: right;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  color: ${styles.colors.gray[500]};
`;
