import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView} from 'react-native';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';
import DateView from '../../components/reportComponent/DateView';
import AppList from '../../components/reportComponent/AppList';
import StyleTab from '../../components/reportComponent/StyleTab';
import Chart from '../../components/reportComponent/Chart';
import MapReportDetail from '../../components/reportComponent/MapReportDetail';
import TimelineList from '../../components/reportComponent/TimelineList';
import MapTimeline from '../../components/reportComponent/MapTimeline';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../../utils/DatabaseService';
import {getReports} from '../../services/apiServices';
import MapReport from '../../components/reportComponent/MapReport';
import data from '../../mock/testData.json';

const ReportScreen = () => {
  const [index, setIndex] = useState(0);
  const templist = ['Bar Chart', 'Map', 'Timeline'];
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [memberId, setMemberId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // 한국 날짜 기준!!
  const getWeekStartDate = (date = new Date()) => {
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localDate = new Date(date.getTime() - timezoneOffset); // Adjust for local timezone
    const currentDay = localDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = localDate.getDate() - currentDay;
    const weekStart = new Date(localDate.setDate(diff));
    console.log(weekStart);

    return weekStart.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  /*라스베거스 날짜 기준
   const getWeekStartDate = (date = new Date()) => {
      const lasVegasTimezoneOffset = -8 * 60 * 60 * 1000; // Las Vegas timezone offset in milliseconds (-8 hours)
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Convert to UTC
      const lasVegasDate = new Date(utcDate.getTime() + lasVegasTimezoneOffset); // Convert to Las Vegas timezone
      const currentDay = lasVegasDate.getDay(); // 0 (Sunday) to 6 (Saturday)
      const diff = lasVegasDate.getDate() - currentDay;
      const weekStart = new Date(lasVegasDate.setDate(diff));
      return weekStart.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    };;
    */

  const getWeekString = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', {month: 'long'});
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOffset = (date.getDay() - firstDayOfMonth.getDay() + 7) % 7;
    const week = Math.ceil((date.getDate() + dayOffset) / 7);

    return `${month.charAt(0).toUpperCase() + month.slice(1)}, Week ${week}`;
  };

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
      Alert.alert('오류', '사용자 정보를 가져오는 중 문제가 발생했습니다.');
      throw error;
    }
  };

  const fetchWeeklyData = async date => {
    try {
      setLoading(true);
      console.log(`Fetching data for date: ${date}`);
      const memberId = await fetchMemberId();
      setMemberId(memberId);
      console.log(`Using memberId: ${memberId}`);

      const response = await getReports(memberId, date);
      console.log('Response from server:', response);

      const weeklyReport = response?.data;
      console.log('weeklyReport from server:', weeklyReport);

      if (!Array.isArray(weeklyReport) || weeklyReport.length === 0) {
        console.warn('No data available for the selected week');
        setChartData([]);
        return;
      }

      // 원본 데이터 그대로 저장
      setChartData(weeklyReport);
    } catch (error) {
      console.error('Error fetching weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentWeekStartDate = getWeekStartDate();
    setSelectedDate(currentWeekStartDate);
    fetchWeeklyData(currentWeekStartDate);
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

  const mapsData = data.data.maps;

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
          {index === 1 && <MapReportDetail appId={3} />}
          {/* {index === 1 && <MapReport data={mapsData} />} */}
          {index === 0 && <Chart data={chartData} type="report" />}
          {(index === 0 || index === 1) && <AppList />}
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
