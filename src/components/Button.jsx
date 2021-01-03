import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Text from './Text';

// Themeable Button
function ThemedButton({
  onPress, style, textStyle, children,
}) {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    button: {
      height: 50,
      borderWidth: 1,
      borderRadius: 50,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowRadius: 0,
      shadowOpacity: 0.75,
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      backgroundColor: colors.button,
    },
  });

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.button, style]}>
        <Text bold size={16} style={[textStyle]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export default React.memo(ThemedButton);
