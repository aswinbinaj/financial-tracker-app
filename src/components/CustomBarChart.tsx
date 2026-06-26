import React from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import Svg, { Rect, G, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { MonthlyTrendPoint } from '../utils';

interface CustomBarChartProps {
  data: MonthlyTrendPoint[];
}

export const CustomBarChart: React.FC<CustomBarChartProps> = ({ data }) => {
  const { colors, spacing } = useTheme();
  
  if (data.length === 0) {
    return (
      <View style={[styles.center, { padding: spacing.xl }]}>
        <RNText style={{ color: colors.textSecondary, fontSize: 16 }}>
          No trend data available.
        </RNText>
      </View>
    );
  }

  // Dimensions setup
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48; // Margin horizontal 24
  const chartHeight = 180;
  
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const drawingWidth = chartWidth - paddingLeft - paddingRight;
  const drawingHeight = chartHeight - paddingTop - paddingBottom;
  
  // Calculate max value for scaling
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expense]),
    100 // Prevent division by zero and scale nicely for low amounts
  );
  
  const numSteps = data.length;
  const stepWidth = drawingWidth / numSteps;
  const barWidth = Math.min(10, stepWidth / 3.2); // Sleek columns
  
  // Grid values (4 divisions)
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y-Axis Grid Lines & Labels */}
        {gridLines.map((percent, idx) => {
          const y = paddingTop + drawingHeight - percent * drawingHeight;
          const gridVal = percent * maxVal;
          let formattedVal = gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}k` : Math.round(gridVal).toString();
          if (idx === 0) formattedVal = '0';
          
          return (
            <G key={`grid-${idx}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fill={colors.textSecondary}
                fontSize={9}
                textAnchor="end"
                fontWeight="500"
              >
                {formattedVal}
              </SvgText>
            </G>
          );
        })}

        {/* Draw Bars */}
        {data.map((item, idx) => {
          const groupCenterX = paddingLeft + idx * stepWidth + stepWidth / 2;
          
          // Income Bar
          const incomeHeight = (item.income / maxVal) * drawingHeight;
          const incomeX = groupCenterX - barWidth - 2;
          const incomeY = paddingTop + drawingHeight - incomeHeight;
          
          // Expense Bar
          const expenseHeight = (item.expense / maxVal) * drawingHeight;
          const expenseX = groupCenterX + 2;
          const expenseY = paddingTop + drawingHeight - expenseHeight;
          
          return (
            <G key={`bars-${idx}`}>
              {/* Income bar */}
              {item.income > 0 && (
                <Rect
                  x={incomeX}
                  y={incomeY}
                  width={barWidth}
                  height={incomeHeight}
                  fill={colors.success}
                  rx={3}
                  ry={3}
                />
              )}
              
              {/* Expense bar */}
              {item.expense > 0 && (
                <Rect
                  x={expenseX}
                  y={expenseY}
                  width={barWidth}
                  height={expenseHeight}
                  fill={colors.primary}
                  rx={3}
                  ry={3}
                />
              )}
              
              {/* X-Axis labels */}
              <SvgText
                x={groupCenterX}
                y={chartHeight - 10}
                fill={colors.textSecondary}
                fontSize={9}
                fontWeight="600"
                textAnchor="middle"
              >
                {item.monthName.split(' ')[0]} {/* just month short name */}
              </SvgText>
            </G>
          );
        })}
        
        {/* Bottom Baseline */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + drawingHeight}
          x2={chartWidth - paddingRight}
          y2={paddingTop + drawingHeight}
          stroke={colors.border}
          strokeWidth={1}
        />
      </Svg>

      {/* Mini Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <RNText style={[styles.legendLabel, { color: colors.textSecondary }]}>Income</RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <RNText style={[styles.legendLabel, { color: colors.textSecondary }]}>Expense</RNText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
