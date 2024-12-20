import React, {useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import DateView from '../../components/reportComponent/DateView';
import AppList from '../../components/reportComponent/AppList';
import StyleTab from '../../components/reportComponent/StyleTab';
import Chart from '../../components/reportComponent/Chart';

const ReportScreen = () => {
  const [index, setIndex] = useState(0);
  const templist = ['Bar Chart', 'Map', 'Timeline'];

  return (
    <Conatiner>
      <TopSection>
        <ScreenTitle>Report</ScreenTitle>
      </TopSection>
      <BottomSection>
        <SubTitle>Top Visited Apps</SubTitle>
        <DateView date="November, Week 1" />
        <StyleTab menus={templist} setIndex={setIndex} />
        <Chart isDetail={false} />
        <AppList />
      </BottomSection>
    </Conatiner>
  );
};

export default ReportScreen;

const Conatiner = styled(ScrollView)`
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #fff;
  margin-bottom: 80px;
`;

const TopSection = styled(View)`
  width: 100%;
  padding: 59px 20px 9px 20px;
  border-bottom: 1px solid ${styles.colors.gray[100]};
`;

const BottomSection = styled(View)`
  width: 100%;
  display: flex;
  gap: 20px;
  padding: 24px 20px;
`;

const ScreenTitle = styled(Text)`
  font-size: 32px;
  font-weight: bold;
  color: ${styles.colors.gray[800]};
`;

const SubTitle = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  color: ${styles.colors.gray[600]};
`;
