import React from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  interpolate, withTiming,
  useAnimatedStyle, useSharedValue, useAnimatedScrollHandler, useAnimatedProps,
} from 'react-native-reanimated';
import { useTheme } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

import Text from '../components/Text';
import BookList from '../components/BookList';
import { useBooksState } from '../BookStore';

const studies = require('../anims/landscape.json');

const LottieViewAnimated = Animated.createAnimatedComponent(LottieView);

// Get morning, afternoon, evening
const getGreeting = () => {
  const hours = (new Date()).getHours();
  if (hours < 12) {
    return 'Good Morning';
  }
  if (hours >= 12 && hours <= 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
};

// home screen
function BookListScreen({ navigation }) {
  const {
    dark, width, colors, margin, navbar, normalize, ios,
  } = useTheme();
  const HEADER = normalize(300, 400);
  const scrollY = useSharedValue(0);
  const loaded = useSharedValue(0);
  const { books } = useBooksState();

  // fade in screen, slowly if light mode is on
  const onLayout = () => {
    loaded.value = withTiming(1, { duration: dark ? 300 : 600 });
  };

  // scrollview handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      scrollY.value = contentOffset.y;
    },
  });

  // go to search screen
  const searchBooks = () => {
    Haptics.selectionAsync();
    navigation.push('BookSearch', { bookList: books });
  };

  // all the styles
  const styles = {
    screen: useAnimatedStyle(() => ({
      flex: 1,
      opacity: loaded.value,
      backgroundColor: colors.card,
    })),
    header: useAnimatedStyle(() => ({
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: interpolate(scrollY.value, [-300, 0], [HEADER + 300, HEADER], 'clamp'),
      paddingTop: navbar,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'flex-end',
      elevation: ios ? undefined : interpolate(scrollY.value, [0, HEADER - 100, HEADER - 80], [0, 0, 10], 'clamp'),
      shadowRadius: ios ? 4 : undefined,
      shadowOffset: ios ? { height: 2, width: 0 } : undefined,
      shadowOpacity: ios ? interpolate(scrollY.value, [0, HEADER - 100, HEADER - 80], [0, 0, 0.15], 'clamp') : undefined,
      backgroundColor: colors.background,
      transform: [
        { translateY: interpolate(scrollY.value, [0, HEADER - navbar], [0, -HEADER + navbar], 'clamp') },
      ],
    })),
    logo: useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, HEADER - 100], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [-300, 0], [-150, 0], 'clamp') },
      ],
    })),
    lottie: {
      top: 5,
      height: '100%',
      opacity: dark ? 0.8 : 1,
    },
    lottieProps: useAnimatedProps(() => ({
      speed: 0.5,
      autoPlay: true,
    })),
    welcomeText: useAnimatedStyle(() => ({
      transform: [
        { scale: interpolate(scrollY.value, [0, HEADER - 110, HEADER - 90], [1, 1, 0.85], 'clamp') },
        { translateY: interpolate(scrollY.value, [0, HEADER - 110, HEADER - 90], [0, 0, 10], 'clamp') },
      ],
    })),
    searchInput: {
      height: 50,
      marginBottom: -25,
      marginTop: margin / 2,
      width: width - margin * 2,
      borderWidth: 1,
      borderRadius: 25,
      paddingHorizontal: 20,
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderColor: colors.background,
    },
    searchIcon: {
      width: 30,
    },
    searchText: {
      opacity: 0.3,
    },
    scrollView: {
      paddingTop: HEADER,
    },
  };

  // filter books into their categories
  const reading = books.filter((b) => b.status === 'Reading');
  const completed = books.filter((b) => b.status === 'Completed');
  const wishlist = books.filter((b) => b.status === 'Wishlist');

  // render all the lists
  return (
    <Animated.View onLayout={onLayout} style={styles.screen}>
      <Animated.View style={styles.header}>
        <Animated.View style={styles.logo}>
          <LottieViewAnimated
            source={studies}
            style={styles.lottie}
            animatedProps={styles.lottieProps}
          />
        </Animated.View>
        <Text animated style={styles.welcomeText} center size={20}>
          {getGreeting()}
        </Text>
        <SharedElement id="search">
          <Pressable onPress={searchBooks} style={styles.searchInput}>
            <Text size={15} style={styles.searchText}>
              <View style={styles.searchIcon}>
                <AntDesign color={colors.text} name="search1" size={15} />
              </View>
              Find your next book...
            </Text>
          </Pressable>
        </SharedElement>
      </Animated.View>

      <Animated.ScrollView
        scrollEventThrottle={1}
        onScroll={scrollHandler}
        contentContainerStyle={styles.scrollView}
      >
        <BookList books={reading} title="Reading" />
        <BookList books={completed} title="Completed" />
        <BookList books={wishlist} title="Wishlist" />
      </Animated.ScrollView>
    </Animated.View>
  );
}

export default React.memo(BookListScreen);
