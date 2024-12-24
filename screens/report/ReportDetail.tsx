import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {styled} from 'styled-components';
import DetailHeader from '../../components/commonComponent/DetailHeader';
import DateView from '../../components/reportComponent/DateView';
import OverviewList from '../../components/reportComponent/OverviewList';
import {styles} from '../../styles/styleGuide';
import Chart from '../../components/reportComponent/Chart';

const ReportDetail = () => {
  const dataDetail = [
    {value: 1, label: 'Sun', color: `${styles.colors.gray[200]}`},
    {value: 2, label: 'Mon', color: `${styles.colors.gray[400]}`},
    {value: 0, label: 'Tue', color: `${styles.colors.gray[100]}`},
    {value: 2, label: 'Wed', color: `${styles.colors.gray[400]}`},
    {value: 4, label: 'Thu', color: `${styles.colors.gray[600]}`},
    {value: 3, label: 'Fri', color: `${styles.colors.gray[400]}`},
    {value: 2, label: 'Sat', color: `${styles.colors.gray[400]}`},
  ];
  const appName = 'Starbucks';
  return (
    <Conatiner>
      <DetailHeader headerTitle={appName} />
      <BottomSection>
        <DateView date="November, Week 1" />
        <Chart data={dataDetail} type="detail" />
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
