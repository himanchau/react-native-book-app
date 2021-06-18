import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { atom, useAtom } from 'jotai';

import Text from './Text';

// default options
const options = {
  message: null,
  type: 'success',
  time: 2000,
};

// using jotai as test
const state = atom(options);

// global container for messages
export default function ToastContainer() {
  const { colors, status } = useTheme();
  const [toast, setToast] = useAtom(state);
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
      backgroundColor: colors[toast.type],
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
    if (toast.message) {
      StatusBar.setBarStyle('light-content');
      show.value = withTiming(0);

      // hide message after given time
      show.value = withDelay(toast.time, withTiming(-height));
      setTimeout(() => {
        setToast(options);
        StatusBar.setBarStyle('default');
      }, toast.time + 300);
    }
  }, [toast.message]);

  return (
    <Animated.View style={styles.container}>
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

// export const useToast = () => useAtom(state);

export const useToast = () => {
  const [, setToast] = useAtom(state);
  return {
    show: (msg, opts) => setToast({
      message: msg,
      type: opts?.type || options.type,
      time: opts?.time || options.time,
    }),
  };
};
