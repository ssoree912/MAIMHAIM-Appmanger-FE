import React, {useRef, useState} from 'react';
import {View, ScrollView, Text} from 'react-native';
import Svg, {Rect, Defs, ClipPath, Path, Line} from 'react-native-svg';
import styled from 'styled-components';
import {styles} from '../../styles/styleGuide';

const predefinedColors = [
  '#41B7AD',
  '#48CBC0',
  '#C6EFEB',
  '#D6F5F2',
  '#E5F9F8',
];

const roundUpToNearest = (num, multiple) => {
  return Math.ceil(num / multiple) * multiple;
};

const ChartDetail = ({data, yAxisSteps = 4}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const chartHeight = 176;
  const barWidth = 20;
  const spacing = (containerWidth - barWidth * 7) / 8;
  const radius = 10;

  console.log('Raw data passed to ChartDetail:', data);

  const processedData = data.map(entry => ({
    value: entry.value || 0,
    label: entry.label || 'Unknown',
  }));

  const maxValue =
    processedData.length > 0
      ? roundUpToNearest(
          Math.max(...processedData.map(item => item.value)),
          yAxisSteps,
        )
      : 1;

  const getBarColor = value =>
    predefinedColors[value % predefinedColors.length];

  return (
    <ChartContainer>
      <LeftSection>
        <ChartCard
          onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}>
          <Svg height={chartHeight} width={containerWidth}>
            {[...Array(yAxisSteps + 1)].map((_, index) => {
              const y = (chartHeight / yAxisSteps) * index;
              return (
                <Line
                  key={index}
                  x1="0"
                  y1={y}
                  x2={containerWidth}
                  y2={y}
                  stroke={styles.colors.gray[100]}
                  strokeWidth="1"
                />
              );
            })}

            {processedData.map((item, index) => {
              const barHeight =
                maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
              const x = spacing + index * (barWidth + spacing);
              const y = chartHeight - barHeight;

              const barColor =
                predefinedColors[index % predefinedColors.length];

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
                    fill={barColor}
                    clipPath={`url(#clip-${index})`}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
        </ChartCard>
        <XLabelContainer $padding={spacing / 2}>
          {processedData.map((item, index) => (
            <XLabelText key={`label-${index}`} textWidth={barWidth + spacing}>
              {item.label}
            </XLabelText>
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

export default ChartDetail;

const ChartContainer = styled(View)`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 9px;
`;

const LeftSection = styled(View)`
  flex: 1;
  display: flex;
  gap: 4px;
`;

const ChartCard = styled(View)`
  flex: 1;
  margin: 8px 0;
  border-radius: 12px;
  border: 1px solid ${styles.colors.gray[100]};
  overflow: hidden;
`;

const XLabelContainer = styled(View)<{$padding: number}>`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 ${props => `${props.$padding}px`};
`;

const XLabelText = styled(Text)<{textWidth: number}>`
  width: ${props => `${props.textWidth}px`};
  text-align: center;
  font-size: 12px;
  color: ${styles.colors.gray[800]};
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
