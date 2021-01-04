import React from 'react';
import {
  Pressable, View, Image, StyleSheet,
} from 'react-native';
import Animated, {
  useDerivedValue, withTiming, interpolate, Extrapolate, useAnimatedStyle, useSharedValue,
} from 'react-native-reanimated';
import { useFocusEffect, useTheme, useNavigation } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';
import * as Haptics from 'expo-haptics';

import Text from './Text';

// Single book component
function Book({ book, scrollX, index }) {
  const navigation = useNavigation();
  const { margin, normalize } = useTheme();
  const BOOKW = normalize(150, 180);
  const BOOKH = BOOKW * 1.5;
  const position = useDerivedValue(() => (index + 0.00001) * (BOOKW + margin) - scrollX.value);
  const inputRange = [-BOOKW, 0, BOOKW, BOOKW * 3];
  const opacity = useSharedValue(1);

  // Show book when focused
  useFocusEffect(() => {
    if (navigation.isFocused()) {
      opacity.value = withTiming(1);
    }
  });

  // View book details
  const bookDetails = () => {
    Haptics.selectionAsync();
    opacity.value = withTiming(0);
    navigation.navigate('BookDetails', { book });
  };

  // Animated styles
  const anims = {
    book: useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { perspective: 800 },
        { scale: interpolate(position.value, inputRange, [0.9, 1, 1, 1], Extrapolate.CLAMP) },
        { rotateY: `${interpolate(position.value, inputRange, [60, 0, 0, 0], Extrapolate.CLAMP)}deg` },
        { translateX: interpolate(position.value, inputRange, [BOOKW / 4, 0, 0, 0], 'clamp') },
      ],
    })),
  };

  // Styles
  const styles = StyleSheet.create({
    imgBox: {
      marginRight: margin,
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
    bookText: {
      marginRight: margin,
      marginTop: margin / 2,
    },
  });

  return (
    <Pressable onPress={bookDetails}>
      <Animated.View style={anims.book}>
        <SharedElement id={book.bookId}>
          <View style={styles.imgBox}>
            <Image style={styles.bookImg} source={{ uri: book.imageUrl }} />
          </View>
        </SharedElement>
        <Text size={13} numberOfLines={1} center style={styles.bookText}>
          {book.author.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default React.memo(Book);
