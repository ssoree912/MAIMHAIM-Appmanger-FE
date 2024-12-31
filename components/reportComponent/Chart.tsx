import React, {useRef, useState} from 'react';
import {View, ScrollView, Text, Image} from 'react-native';
import Svg, {Rect, Defs, ClipPath, Path, Line} from 'react-native-svg';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';

const roundUpToNearest = (num: number, multiple: number) => {
  return Math.ceil(num / multiple) * multiple;
};

const predefinedColors = ['#41B7AD', '#48CBC0', '#C6EFEB', '#C6EFEB'];

const Chart = ({
  data,
  yAxisSteps = 4,
}: {
  data: any[]; // 원본 데이터를 받음
  yAxisSteps?: number;
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const chartScrollRef = useRef<ScrollView>(null);
  const labelScrollRef = useRef<ScrollView>(null);
  const chartHeight = 176;
  const margin = 44;
  const barWidth = 36;
  const radius = barWidth / 2;
  const spacing = 32;

  console.log('Raw data passed to Chart:', data);

  // 데이터 정제
  const processedData = data
    .filter(entry => entry && typeof entry.appName === 'string')
    .sort((a, b) => b.count - a.count) // value가 많은 순으로 정렬
    .slice(0, 4) // 상위 4개만 선택
    .map((entry, index) => ({
      value: entry.count || 0,
      label: entry.appName || 'Unknown',
      color: predefinedColors[index] || '#CCCCCC', // 지정된 색상 사용, 없으면 기본색
      image: entry.image, // 앱 이미지 추가
    }));

  console.log('Processed data for Chart:', processedData);

  if (!processedData || processedData.length === 0) {
    console.warn('Chart data is empty or invalid:', processedData);
    return (
      <EmptyChartContainer>
        <EmptyText>No data available</EmptyText>
      </EmptyChartContainer>
    );
  }

  const rawMaxValue = Math.max(...processedData.map(item => item.value));
  const maxValue =
    rawMaxValue > 0 ? roundUpToNearest(rawMaxValue, yAxisSteps) : 1;

  const tempChartWidth =
    margin * 2 + processedData.length * (barWidth + spacing) - spacing;
  const chartWidth =
    tempChartWidth > containerWidth ? tempChartWidth : containerWidth;

  const handleScroll = event => {
    const scrollX = event.nativeEvent.contentOffset.x;
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollTo({x: scrollX, animated: false});
    }
  };

  return (
    <ChartContainer>
      <LeftSection>
        <ChartCard
          onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}>
          <ScrollView
            ref={chartScrollRef}
            horizontal
            contentContainerStyle={{
              width: chartWidth,
            }}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={1}
            onScroll={handleScroll}
            alwaysBounceHorizontal={false}
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
                if (!item || typeof item.value !== 'number') {
                  console.error(`Invalid item at index ${index}:`, item);
                  return null; // 잘못된 항목은 무시
                }
                console.log(`Item being rendered (index: ${index}):`, item);
                const barHeight =
                  maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
                console.log(
                  `Calculated barHeight: ${barHeight} for index ${index}`,
                );

                console.log(
                  `Rendering AppIcon for index ${index}:`,
                  item.image,
                ); // 로그 추가
                const x = margin + index * (barWidth + spacing);
                console.log(`Calculated x position for index ${index}: ${x}`);
                const y = chartHeight - barHeight;

                return (
                  <React.Fragment key={index}>
                    <Defs>
                      <ClipPath id={`clip-${index}`}>
                        <Path
                          d={`M${x},${y + barHeight}
                           L${x},${y + radius}
                           Q${x},${y} ${x + radius},${y}
                           L${x + barWidth - radius},${y}
                           Q${x + barWidth},${y} ${x + barWidth},${y + radius}
                           L${x + barWidth},${y + barHeight} Z`}
                        />
                      </ClipPath>
                    </Defs>
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={item.color}
                      clipPath={`url(#clip-${index})`}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>
          </ScrollView>
        </ChartCard>
        <XLabelContainer
          ref={labelScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 24,
            width: chartWidth,
          }}>
          {processedData.map((item, index) => (
            <AppIcon
              key={`icon-${index}`}
              source={{uri: item.image}}
              onLoad={() =>
                console.log(`Image loaded for index ${index}: ${item.image}`)
              }
              onError={error =>
                console.error(`Image failed to load for index ${index}:`, error)
              }
            />
          ))}
        </XLabelContainer>
      </LeftSection>
      <YLabelContainer>
        {[...Array(yAxisSteps + 1)].map((_, index) => {
          const labelValue = maxValue - (maxValue / yAxisSteps) * index;
          return <YLabel key={index}>{Math.round(labelValue)}</YLabel>;
        })}
      </YLabelContainer>
    </ChartContainer>
  );
};

const ChartContainer = styled(View)`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 9px;
`;

const YLabelContainer = styled(View)`
  height: 192px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const YLabel = styled(Text)`
  color: ${styles.colors.gray[200]};
  font-size: 12px;
`;

const LeftSection = styled(View)`
  flex: 1;
  display: flex;
  gap: 4px;
`;

const XLabelContainer = styled(ScrollView)`
  padding: 0 40px;
`;

const ChartCard = styled(View)`
  width: 100%;
  margin: 8px 0; /* 차트와 리스트 간격 */
  border-radius: 12px;
  border: 1px solid ${styles.colors.gray[100]};
  overflow: hidden;
`;

// 추가된 빈 차트 스타일
const EmptyChartContainer = styled(View)`
  width: 100%;
  height: 176px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${styles.colors.gray[100]};
  border-radius: 12px;
`;

const EmptyText = styled(Text)`
  font-size: 16px;
  color: ${styles.colors.gray[600]};
`;

const AppIcon = styled(Image)`
  width: 44px;
  height: 44px;
  border-radius: 8.25px;
  background-color: #ffffff;
`;

export default Chart;
