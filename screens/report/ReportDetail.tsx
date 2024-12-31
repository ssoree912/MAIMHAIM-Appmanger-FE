import React, {useState, useEffect} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {styled} from 'styled-components';
import {useLocation} from 'react-router-native'; // To access navigation parameters
import DetailHeader from '../../components/commonComponent/DetailHeader';
import DateView from '../../components/reportComponent/DateView';
import OverviewList from '../../components/reportComponent/OverviewList';
import {styles} from '../../styles/styleGuide';
import Chart from '../../components/reportComponent/Chart';
import Chart_detail from '../../components/reportComponent/Chart_detail';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatabaseService from '../../utils/DatabaseService';
import {getAppReport} from '../../services/apiServices';


const ReportDetail = () => {
  // Access navigation parameters
  const location = useLocation();
    const {state} = location || {};
   const {appId, weekList, appName} = state || {};
   const [selectedDate, setSelectedDate] = useState('');
const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [overviewData, setOverviewData] = useState([]);

  if (!weekList || !appName) {
    console.error('Missing appName or weekList in navigation parameters');
    return (
      <Conatiner>
        <Text>Error: Missing data</Text>
      </Conatiner>
    );
  }

  // Map weekList to format suitable for the Chart
  const dataDetail = weekList.map((value, index) => ({
    value,
    label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
    color: `${styles.colors.gray[200]}`, // You can adjust the color logic here
  }));


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

   const fetchWeeklyData = async (date) => {
      try {
        setLoading(true);
        console.log(`Fetching weekly data for date: ${date}, appId: ${appId}`);
        const memberId = await AsyncStorage.getItem('memberId');
        if (!memberId) throw new Error('Member ID is missing.');

        const response = await getAppReport(memberId, date, appId);
        console.log('Fetched data:', response);

        const {reportInfo, locationInfos} = response.data;

        // Update state
        const weeklyReport = reportInfo?.weeklyReport || [];
        const weeklyData = weeklyReport.map((value, index) => ({
          value,
          label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
          color: `${styles.colors.gray[200]}`,
        }));

        setChartData(weeklyData);
        setOverviewData(locationInfos || []);
        console.log('Updated chartData:', weeklyData);
        console.log('Updated overviewData:', locationInfos);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
        setChartData([]);
        setOverviewData([]);
      } finally {
        setLoading(false);
      }
    };

   useEffect(() => {
      const todayDate = new Date().toISOString().split('T')[0];
      setSelectedDate(todayDate);
      fetchWeeklyData(todayDate);
    }, []);



   return (
      <Conatiner>
        <DetailHeader headerTitle={appName} />
        <BottomSection>
          <DateView
            date={selectedDate ? `${new Date(selectedDate).toLocaleString('en-US', {month: 'long'})}, Week ${Math.ceil(new Date(selectedDate).getDate() / 7)}` : 'Loading...'}
            onPrevious={handlePrevWeek}
            onNext={handleNextWeek}
          />
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              <Chart_detail data={chartData} type="detail" />
              <ListTitle>Branch Overview</ListTitle>
              <OverviewList appName={appName} data={overviewData} />
            </>
          )}
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
