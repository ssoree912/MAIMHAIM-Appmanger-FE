import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {styled} from 'styled-components';
import DetailHeader from '../../components/commonComponent/DetailHeader';
import Chart from '../../components/reportComponent/Chart';
import DateView from '../../components/reportComponent/DateView';
import OverviewList from '../../components/reportComponent/OverviewList';
import {styles} from '../../styles/styleGuide';

const ReportDetail = () => {
  const appName = 'Starbucks';
  return (
    <Conatiner>
      <DetailHeader headerTitle={appName} />
      <BottomSection>
        <DateView date="November, Week 1" />
        <Chart isDetail={true} />
        <ListTitle>Branch Overview</ListTitle>
        <OverviewList appName={appName} />
      </BottomSection>
    </Conatiner>
  );
};

export default ReportDetail;

const Conatiner = styled(ScrollView)`
  display: flex;
  width: 100%;
  height: 100%;
  margin-bottom: 80px;
`;

const BottomSection = styled(View)`
  display: flex;
  width: 100%;
  padding: 20px;
`;

const ListTitle = styled(Text)`
  font-size: 16px;
  line-height: 24px;
  color: ${styles.colors.gray[800]};
  font-weight: bold;
  margin: 24px 0 16px 0;
`;
