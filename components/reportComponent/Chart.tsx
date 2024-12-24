import React from 'react';
import {Dimensions, View} from 'react-native';
import {BarChart} from 'react-native-gifted-charts';
import {styles} from '../../styles/styleGuide';

const screenWidth = Dimensions.get('window').width;

const Chart = ({isDetail}: {isDetail: boolean}) => {
  const data = [
    {value: 18, label: 'Q1', frontColor: `${styles.colors.gray[400]}`},
    {value: 15, label: 'Q2', frontColor: `${styles.colors.gray[300]}`},
    {value: 10, label: 'Q3', frontColor: `${styles.colors.gray[200]}`},
    {value: 5, label: 'Q4', frontColor: `${styles.colors.gray[100]}`},
  ];

  const dataDetail = [
    {value: 1, label: 'Sun', frontColor: `${styles.colors.gray[200]}`},
    {value: 2, label: 'Mon', frontColor: `${styles.colors.gray[400]}`},
    {value: 0, label: 'Tue', frontColor: `${styles.colors.gray[100]}`},
    {value: 2, label: 'Wed', frontColor: `${styles.colors.gray[400]}`},
    {value: 4, label: 'Thu', frontColor: `${styles.colors.gray[600]}`},
    {value: 3, label: 'Fri', frontColor: `${styles.colors.gray[400]}`},
    {value: 2, label: 'Sat', frontColor: `${styles.colors.gray[400]}`},
  ];

  return (
    <View>
      <BarChart
        data={isDetail ? dataDetail : data}
        barWidth={isDetail ? 20 : 32}
        yAxisThickness={0}
        xAxisThickness={0}
        barBorderRadius={isDetail ? 5 : 8}
        noOfSections={3}
        width={screenWidth - 42}
      />
    </View>
  );
};

export default Chart;
