
  import React, {useRef, useState} from 'react';
  import {View, ScrollView, Text} from 'react-native';
  import Svg, {Rect, Line} from 'react-native-svg';
  import styled from 'styled-components';
  import {styles} from '../../styles/styleGuide';

  const predefinedColors = ['#41B7AD', '#48CBC0', '#C6EFEB', '#D6F5F2', '#E5F9F8'];

  const roundUpToNearest = (num, multiple) => {
    return Math.ceil(num / multiple) * multiple;
  };

  const ChartDetail = ({data, yAxisSteps = 4}) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const chartScrollRef = useRef<ScrollView>(null);

    const chartHeight = 200;
    const margin = 24;
    const barWidth = 32;
    const spacing = 16;

    console.log('Raw data passed to ChartDetail:', data);

    const processedData = data.map((entry) => ({
      value: entry.value || 0,
      label: entry.label || 'Unknown',
    }));

    const maxValue = processedData.length > 0
      ? roundUpToNearest(Math.max(...processedData.map((item) => item.value)), yAxisSteps)
      : 1;

    const tempChartWidth = margin * 2 + processedData.length * (barWidth + spacing) - spacing;
    const chartWidth = tempChartWidth > containerWidth ? tempChartWidth : containerWidth;

      const getBarColor = (value) => predefinedColors[value % predefinedColors.length];


    const handleScroll = (event) => {
      const scrollX = event.nativeEvent.contentOffset.x;
      if (chartScrollRef.current) {
        chartScrollRef.current.scrollTo({x: scrollX, animated: false});
      }
    };

      return (
        <ChartContainer>
          <ChartWithYAxis>
            <ChartCard
              onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}>
              <ScrollView
                ref={chartScrollRef}
                horizontal
                contentContainerStyle={{width: chartWidth}}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={1}
                onScroll={handleScroll}
                overScrollMode="never"
                bounces={false}>
                <Svg height={chartHeight} width={chartWidth}>
                  {[...Array(yAxisSteps + 1)].map((_, index) => {
                    const y = (chartHeight / yAxisSteps) * index;
                    return (
                      <Line
                        key={index}
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke={styles.colors.gray[100]}
                        strokeWidth="1"
                      />
                    );
                  })}

                  {processedData.map((item, index) => {
                    const barHeight = (item.value / maxValue) * chartHeight;
                    const x = margin + index * (barWidth + spacing);
                    const y = chartHeight - barHeight;

                    const barColor = predefinedColors[index % predefinedColors.length];

                    return (
                      <Rect
                        key={index}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={barColor}
                      />
                    );
                  })}
                </Svg>
              </ScrollView>
            </ChartCard>
            <YLabelContainer>
              {[...Array(yAxisSteps + 1)].map((_, index) => {
                const labelValue = maxValue - (maxValue / yAxisSteps) * index;
                return <YLabel key={index}>{Math.round(labelValue)}</YLabel>;
              })}
            </YLabelContainer>
          </ChartWithYAxis>
          <XLabelContainer>
            {processedData.map((item, index) => (
              <XLabelText key={`label-${index}`}>{item.label}</XLabelText>
            ))}
          </XLabelContainer>
        </ChartContainer>
      );
    };

    export default ChartDetail;

    const ChartContainer = styled(View)`
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    const ChartWithYAxis = styled(View)`
      width: 100%;
      flex-direction: row;
      align-items: flex-start;
    `;

    const ChartCard = styled(View)`
      flex: 1;
      margin-bottom: 16px;
      border-radius: 12px;
      border: 1px solid ${styles.colors.gray[100]};
      overflow: hidden;
    `;

    const XLabelContainer = styled(View)`
      flex-direction: row;
      justify-content: space-around;
      width: 100%;
      padding: 0 24px;
    `;

    const XLabelText = styled(Text)`
      width: 44px;
      text-align: center;
      font-size: 12px;
      color: ${styles.colors.gray[800]};
    `;

    const YLabelContainer = styled(View)`
      justify-content: space-between;
      height: 200px;
      padding-left: 8px;
    `;

    const YLabel = styled(Text)`
      font-size: 12px;
      color: ${styles.colors.gray[600]};
    `;