import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { formatCurrency } from '../utils';

interface PieChartItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CustomPieChartProps {
  data: PieChartItem[];
  currency: string;
}

export const CustomPieChart: React.FC<CustomPieChartProps> = ({ data, currency }) => {
  const { colors, spacing } = useTheme();
  
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  
  if (data.length === 0 || totalAmount === 0) {
    return (
      <View style={[styles.center, { padding: spacing.xl }]}>
        <RNText style={{ color: colors.textSecondary, fontSize: 16 }}>
          No expense data available for chart.
        </RNText>
      </View>
    );
  }

  // Chart configuration
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;

  let currentOffset = 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background track circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={colors.border}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Slice circles */}
            {data.map((item, index) => {
              const sliceLength = (item.percentage / 100) * circumference;
              const strokeOffset = circumference - sliceLength + currentOffset;
              
              // Accumulate offset for next slice (Zustand rotates counterclockwise)
              currentOffset -= sliceLength;
              
              return (
                <Circle
                  key={`${item.name}-${index}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={`${sliceLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              );
            })}
          </G>
        </Svg>
        
        {/* Total Expense Label inside Donut */}
        <View style={styles.innerLabelContainer}>
          <RNText style={[styles.innerLabelTitle, { color: colors.textSecondary }]}>
            Total Spent
          </RNText>
          <RNText style={[styles.innerLabelVal, { color: colors.text }]} numberOfLines={1}>
            {formatCurrency(totalAmount, currency)}
          </RNText>
        </View>
      </View>

      {/* Legend Grid */}
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={`legend-${item.name}-${index}`} style={styles.legendItem}>
            <View style={styles.legendRow}>
              <View style={[styles.indicator, { backgroundColor: item.color }]} />
              <RNText style={[styles.legendName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </RNText>
            </View>
            <RNText style={[styles.legendValue, { color: colors.textSecondary }]}>
              {item.percentage}% ({formatCurrency(item.amount, currency)})
            </RNText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  innerLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  innerLabelTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  innerLabelVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  legendContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    width: '48%',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  legendValue: {
    fontSize: 11,
    paddingLeft: 16,
  },
});
