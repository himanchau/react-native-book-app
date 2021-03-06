import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated from 'react-native-reanimated';

// Themeable / Animatable Text
function AnimatedText(props) {
  const { colors } = useTheme();
  const {
    children, style, size, bold, center, color, animated,
  } = props;

  const styles = StyleSheet.compose({
    color: color || colors.text,
    fontSize: size || 14,
    fontWeight: bold ? '500' : '400',
    fontFamily: (Platform.OS === 'ios') ? 'Avenir Next' : '',
    textAlign: center ? 'center' : null,
  });

  // Animatable
  if (animated) {
    return (
      <Animated.Text allowFontScaling={false} {...props} style={[styles, style]}>
        {children}
      </Animated.Text>
    );
  }

  return (
    <Text allowFontScaling={false} {...props} style={[styles, style]}>
      {children}
    </Text>
  );
}

export default React.memo(AnimatedText);
