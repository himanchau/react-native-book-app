import React from 'react';
import {
  Pressable, View, StyleSheet, StatusBar,
} from 'react-native';
import Animated, {
  useDerivedValue, withTiming, interpolate, Extrapolate, useAnimatedStyle, useSharedValue,
} from 'react-native-reanimated';
import { useFocusEffect, useTheme, useNavigation } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';
import * as Haptics from 'expo-haptics';

import Text from './Text';

// Single book component
const Book = ({ book, scrollX, index }) => {
  const navigation = useNavigation();
  const { width, margin } = useTheme();
  const BOOKW = width / 2.5;
  const BOOKH = BOOKW * 1.5;
  const position = useDerivedValue(() => (index + 0.00001) * (BOOKW) - scrollX.value);
  const inputRange = [-BOOKW, 0, BOOKW, BOOKW * 3];
  const opacity = useSharedValue(1);

  // Show book when focused
  useFocusEffect(() => {
    if (navigation.isFocused()) {
      opacity.value = withTiming(1);
      StatusBar.setHidden(false, 'fade');
    }
  });

  // View book details
  const bookDetails = () => {
    Haptics.selectionAsync();
    opacity.value = withTiming(0);
    StatusBar.setHidden(true, 'fade');
    navigation.navigate('BookDetails', { book });
  };

  // Animated styles
  const anims = {
    book: useAnimatedStyle(() => ({
      width: BOOKW,
      height: BOOKH,
      shadowRadius: 5,
      shadowOpacity: 0.5,
      shadowOffset: { width: 5, height: 5 },
      transform: [
        { perspective: 1000 },
        { scale: interpolate(position.value, inputRange, [0.9, 1, 1, 1], Extrapolate.CLAMP) },
        { rotateY: `${interpolate(position.value, inputRange, [80, 0, 0, 0], Extrapolate.CLAMP)}deg` },
        { translateX: interpolate(position.value, inputRange, [BOOKW - BOOKW / 2, 0, 0, 0], Extrapolate.IDENTITY) },
      ],
      opacity: opacity.value === 0 ? opacity.value : interpolate(position.value, inputRange, [0, 1, 1, 0.75], Extrapolate.CLAMP),
    })),
    bookImg: useAnimatedStyle(() => ({
      flex: 1,
      borderRadius: 10,
      transform: [
        { scale: interpolate(position.value, inputRange, [1, 1, 1, 1.2], Extrapolate.CLAMP) },
      ],
    })),
  };

  // Styles
  const styles = StyleSheet.create({
    bookText: {
      marginRight: margin,
      marginTop: margin / 2,
    },
    bookBox: {
      flex: 1,
      marginRight: margin,
      overflow: 'hidden',
      borderRadius: 10,
    },
  });

  return (
    <Pressable onPress={bookDetails}>
      <Animated.View style={anims.book}>
        <View style={styles.bookBox}>
          <SharedElement style={{ flex: 1 }} id={book.bookId}>
            <Animated.Image style={anims.bookImg} source={{ uri: book.imageUrl }} />
          </SharedElement>
        </View>
        <Text size={13} numberOfLines={1} center style={styles.bookText}>
          {book.author.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(Book);
