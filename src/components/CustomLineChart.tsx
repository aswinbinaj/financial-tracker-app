import React from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import Svg, { Path, G, Line, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { MonthlyTrendPoint } from '../utils';

interface CustomLineChartProps {
  data: MonthlyTrendPoint[];
}

export const CustomLineChart: React.FC<CustomLineChartProps> = ({ data }) => {
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
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const drawingWidth = chartWidth - paddingLeft - paddingRight;
  const drawingHeight = chartHeight - paddingTop - paddingBottom;
  
  // Calculate max value for scaling based on expenses (spending trend)
  const maxVal = Math.max(
    ...data.map((d) => d.expense),
    100 // Prevent division by zero and scale nicely
  );
  
  const numPoints = data.length;
  const stepWidth = drawingWidth / (numPoints - 1 || 1);
  
  // Construct coordinates for the line chart points (Expenses)
  const points = data.map((item, idx) => {
    const x = paddingLeft + idx * stepWidth;
    const y = paddingTop + drawingHeight - (item.expense / maxVal) * drawingHeight;
    return { x, y, val: item.expense, month: item.monthName.split(' ')[0] };
  });

  // Create path command strings
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    // Generate SVG path for line
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    // Generate SVG path for area fill (closed loop under the line)
    const baselineY = paddingTop + drawingHeight;
    areaPath = `M ${points[0].x} ${baselineY} L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      areaPath += ` L ${points[i].x} ${points[i].y}`;
    }
    areaPath += ` L ${points[points.length - 1].x} ${baselineY} Z`;
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          {/* Area under line gradient */}
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

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

        {/* Area path */}
        {areaPath !== '' && <Path d={areaPath} fill="url(#areaGradient)" />}

        {/* Line path */}
        {linePath !== '' && (
          <Path
            d={linePath}
            fill="transparent"
            stroke={colors.primary}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Point Markers & Bottom X Labels */}
        {points.map((pt, idx) => {
          return (
            <G key={`pt-${idx}`}>
              {/* Outer halo */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={6}
                fill={colors.primary}
                opacity={0.3}
              />
              {/* Inner dot */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={colors.surface}
                stroke={colors.primary}
                strokeWidth={2.5}
              />
              
              {/* Point value on hover (simplified: always visible if spacing permits) */}
              <SvgText
                x={pt.x}
                y={pt.y - 12}
                fill={colors.text}
                fontSize={8}
                fontWeight="700"
                textAnchor="middle"
              >
                {pt.val > 0 ? `$${Math.round(pt.val)}` : ''}
              </SvgText>

              {/* X Axis Label */}
              <SvgText
                x={pt.x}
                y={chartHeight - 10}
                fill={colors.textSecondary}
                fontSize={9}
                fontWeight="600"
                textAnchor="middle"
              >
                {pt.month}
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
});
