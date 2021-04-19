import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { proxy, useSnapshot } from 'valtio';
import Animated, {
  useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';

import Text from './Text';

// create store using zustant & immer
const state = proxy({
  message: null,
  type: 'success',
  time: 2000,
});

// global container for messages
export default function ToastContainer() {
  const { setBarStyle } = StatusBar;
  const { message, time, type } = useSnapshot(state);
  const { colors, status } = useTheme();
  const height = status + 44;
  const show = useSharedValue(-height);

  const styles = {
    container: useAnimatedStyle(() => ({
      height,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      position: 'absolute',
      paddingTop: status,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors[type],
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      transform: [
        { translateY: show.value },
      ],
    })),
    text: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.white,
    },
  };

  // show/hide when message set
  useEffect(() => {
    if (message) {
      setBarStyle('light-content');
      show.value = withTiming(0);

      // hide message after given time
      show.value = withDelay(time, withTiming(-height));
      setTimeout(() => {
        state.message = null;
        setBarStyle('default');
      }, time + 300);
    }
  }, [message]);

  return (
    <Animated.View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

// allow message to be shown
export const showMessage = (message, options) => {
  state.message = message;
  state.type = options?.type || 'success';
  state.time = options?.time || 2000;
};
