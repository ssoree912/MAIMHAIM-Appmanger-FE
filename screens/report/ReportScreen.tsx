import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import DateView from '../../components/reportComponent/DateView';
import AppList from '../../components/reportComponent/AppList';
import StyleTab from '../../components/reportComponent/StyleTab';
import Chart from '../../components/reportComponent/Chart';
import MapReport from '../../components/reportComponent/MapReport';
import TimelineList from '../../components/reportComponent/TimelineList';
import MapTimeline from '../../components/reportComponent/MapTimeline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getReports} from '../../services/apiServices';
import data from '../../mock/testData.json';
import MapReportDetail from '../../components/reportComponent/MapReportDetail';

const ReportScreen = () => {
  const [index, setIndex] = useState(0);
  const templist = ['Bar Chart', 'Map', 'Timeline'];
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [memberId, setMemberId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [appId, setAppId] = useState<number | null>(null);

  const getWeekStartDate = (date = new Date()) => {
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localDate = new Date(date.getTime() - timezoneOffset); // Adjust for local timezone
    return localDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const getTodayDate = () => {
    const date = new Date();
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localDate = new Date(date.getTime() - timezoneOffset); // Adjust for local timezone
    return localDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const getWeekString = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', {month: 'long'});
    const day = date.getDate();

    const firstDayOfMonth = new Date(year, date.getMonth(), 1);
    const weekOffset = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

    const week = Math.ceil((day + weekOffset) / 7);

    if (week > 5 && day > 28) {
      const nextMonth = new Date(year, date.getMonth() + 1, 1);
      const nextMonthName = nextMonth.toLocaleString('en-US', {month: 'long'});
      return `${nextMonthName}, Week 1`;
    }

    return `${month}, Week ${week}`;
  };

  const fetchMemberId = async () => {
    try {
      const storedMemberId = await AsyncStorage.getItem('memberId');
      if (!storedMemberId) {
        throw new Error('Member ID not found in AsyncStorage.');
      }
      return parseInt(storedMemberId, 10);
    } catch (error) {
      console.error('Error fetching memberId:', error);
      throw error;
    }
  };

  const fetchWeeklyData = async date => {
    try {
      setLoading(true);
      console.log(`Fetching data for date: ${date}`);
      const memberId = await fetchMemberId();
      console.log(`Using memberId: ${memberId}`);

      const response = await getReports(memberId, date);
      console.log('Response from server:', response);

      const weeklyReport = response?.data;
      console.log('weeklyReport from server:', weeklyReport);

      setChartData(weeklyReport || []);
      console.log('Updated chartData:', weeklyReport);
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      setChartData([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentWeekStartDate = getWeekStartDate();
    const todayDate = getTodayDate();
    console.log(`Today: ${todayDate}, Week Start: ${currentWeekStartDate}`);
    setSelectedDate(todayDate);
    fetchWeeklyData(todayDate);
  }, []);

  const handlePrevWeek = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 7);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
    fetchWeeklyData(newDate);
  };

  const handleNextWeek = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 7);
    const newDate = currentDate.toISOString().split('T')[0];
    setSelectedDate(newDate);
    fetchWeeklyData(newDate);
  };

  return (
    <Conatiner>
      <TopSection>
        <ScreenTitle>Report</ScreenTitle>
      </TopSection>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Loading data...</Text>
        </View>
      ) : (
        <BottomSection>
          <SubTitle>Top Visited Apps</SubTitle>
          <DateView
            date={getWeekString(selectedDate)}
            onPrevious={handlePrevWeek}
            onNext={handleNextWeek}
          />
          <StyleTab menus={templist} setIndex={setIndex} />
          {index === 1 && appId === null && <MapReport data={data.data.maps} />}
          {index === 1 && appId !== null && <MapReportDetail appId={appId} />}
          {index === 0 && <Chart data={chartData} />}
          {(index === 0 || index === 1) && (
            <AppList
              apps={chartData}
              styleIndex={index}
              appId={appId}
              setAppId={setAppId}
            />
          )}
          {index === 2 && <MapTimeline />}
          {index === 2 && <TimelineList />}
        </BottomSection>
      )}
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
