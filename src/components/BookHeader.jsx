/* eslint-disable no-param-reassign */
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  withTiming, interpolate, Extrapolate, runOnJS,
  useAnimatedStyle, useSharedValue, useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { SharedElement } from 'react-navigation-shared-element';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import Text from './Text';

// Load a single book
function BookHeader({
  scrollY, book, x, y, navigation,
}) {
  const {
    width, margin, dark, normalize,
  } = useTheme();
  const insets = useSafeAreaInsets();
  const moving = useSharedValue(0);
  const closing = useSharedValue(0);
  const BOOKW = normalize(150, 180);
  const BOOKH = BOOKW * 1.5;

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = x.value;
      ctx.startY = y.value;
      moving.value = 1;
    },
    onActive: (e, ctx) => {
      x.value = ctx.startX + e.translationX;
      y.value = ctx.startY + e.translationY;

      // See if closing screen
      const flung = Math.abs(e.velocityX) > 250 || Math.abs(y.value) >= 50;
      if (flung && !closing.value) {
        closing.value = 1;
        runOnJS(navigation.goBack)();
        runOnJS(Haptics.selectionAsync)();
      }
    },
    onEnd: () => {
      if (y.value < 50) {
        x.value = withTiming(0);
        y.value = withTiming(0);
      }
      moving.value = 0;
    },
  });

  // Animated styles
  const anims = {
    header: useAnimatedStyle(() => ({
      width,
      zIndex: 10,
      position: 'absolute',
      justifyContent: 'center',
      paddingTop: insets.top,
      height: width + insets.top,
      shadowOffset: { height: 2 },
      backgroundColor: dark ? `rgba(0,0,0,${interpolate(y.value, [0, 50], [1, 0])})` : `rgba(255,255,255,${interpolate(y.value, [0, 50], [1, 0])})`,
      shadowOpacity: interpolate(scrollY.value, [width - 44, width - 20], [0, 0.5], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [0, width - 44], [0, -width + 44], 'clamp') },
      ],
    })),
    bg: useAnimatedStyle(() => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      position: 'absolute',
      opacity: interpolate(y.value, [0, 50], [0.5, 0], Extrapolate.CLAMP),
    })),
    cover: useAnimatedStyle(() => ({
      zIndex: 10,
      alignItems: 'center',
      opacity: interpolate(scrollY.value, [0, width - 44], [1, 0], Extrapolate.CLAMP),
      transform: [
        { scale: interpolate(scrollY.value, [-50, 0], [1.1, 1], Extrapolate.CLAMP) },
        { translateX: x.value },
        { translateY: y.value },
      ],
    })),
    title: useAnimatedStyle(() => ({
      alignItems: 'center',
      paddingTop: margin,
      paddingHorizontal: margin * 3,
      transform: [
        { translateY: interpolate(scrollY.value, [-50, 0], [20, 0], Extrapolate.CLAMP) },
      ],
      opacity: moving.value
        ? interpolate(y.value, [0, 50], [1, 0], Extrapolate.CLAMP)
        : interpolate(scrollY.value, [0, width - 44], [1, 0], Extrapolate.CLAMP),
    })),
    title2: useAnimatedStyle(() => ({
      left: 0,
      right: 0,
      bottom: 0,
      height: 44,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: margin,
      opacity: interpolate(scrollY.value, [width - 44, width], [0, 1], Extrapolate.CLAMP),
    })),
  };

  // Styles
  const styles = StyleSheet.create({
    imgBox: {
      borderRadius: 10,
      shadowRadius: 5,
      shadowOpacity: 0.5,
      shadowOffset: { width: 5, height: 5 },
    },
    bookImg: {
      width: BOOKW,
      height: BOOKH,
      borderRadius: 10,
    },
    author: {
      marginTop: margin / 4,
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={anims.header}>
        <Animated.Image blurRadius={15} style={anims.bg} source={{ uri: book.imageUrl }} />

        <Animated.View style={anims.cover}>
          <SharedElement id={book.bookId}>
            <View style={styles.imgBox}>
              <Image style={styles.bookImg} source={{ uri: book.imageUrl }} />
            </View>
          </SharedElement>
        </Animated.View>

        <Animated.View style={anims.title}>
          <Text bold center size={21}>{book.bookTitleBare}</Text>
          <Text size={15} style={styles.author}>{`by ${book.author.name}`}</Text>
        </Animated.View>

        <Animated.View style={anims.title2}>
          <Text numberOfLines={1} bold size={17}>
            {book.bookTitleBare}
          </Text>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
}

export default (BookHeader);
