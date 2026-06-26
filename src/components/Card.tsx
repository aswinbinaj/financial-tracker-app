import React from 'react';
import { StyleSheet, View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  outlined?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, outlined = false, ...props }) => {
  const { colors, spacing, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          padding: spacing.md,
          borderColor: colors.border,
          borderWidth: outlined ? 1 : 0,
        },
        !outlined && shadows,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});
