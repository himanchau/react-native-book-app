import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  interpolate, Extrapolate, withTiming,
  useAnimatedStyle, useSharedValue, useAnimatedScrollHandler, useAnimatedProps,
} from 'react-native-reanimated';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SharedElement } from 'react-navigation-shared-element';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

import Text from '../components/Text';
import Button from '../components/Button';
import List from '../components/BookList';

const studies = require('../anims/studies.json');

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

// Default screen
function BookList({ navigation }) {
  const { colors, margin, navbar } = useTheme();
  const [reading, setReading] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [bookList, setBookList] = useState([]);
  const scrollY = useSharedValue(0);
  const loaded = useSharedValue(0);

  // Scrollview handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      scrollY.value = contentOffset.y;
    },
  });

  // Load data from async storage
  const loadData = async () => {
    const json = await AsyncStorage.getItem('@lists');
    const data = json ? JSON.parse(json) : [];
    setBookList(data);
  };

  // Go to search screen
  const searchBooks = () => {
    Haptics.selectionAsync();
    navigation.push('BookSearch', { bookList });
  };

  // Reload books when focused
  useFocusEffect(
    React.useCallback(() => {
      if (!loaded.value) {
        loadData();
        loaded.value = 1;
      } else {
        setTimeout(loadData, 450);
      }
    }, []),
  );

  // Process and save list
  useEffect(() => {
    if (bookList.length) {
      const [rList, cList, wList] = [[], [], []];
      bookList.forEach((bk) => {
        switch (bk.status) {
          case 'Wishlist':
            wList.push(bk);
            break;
          case 'Completed':
            cList.push(bk);
            break;
          default:
            rList.push(bk);
        }
        setReading(rList);
        setCompleted(cList);
        setWishlist(wList);
      });
    }
  }, [bookList]);

  // Animated Styles
  const anims = {
    header: useAnimatedStyle(() => ({
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: 350,
      padding: margin,
      paddingTop: navbar,
      shadowRadius: 2,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'flex-end',
      shadowOffset: { height: 2, width: 0 },
      backgroundColor: colors.background,
      shadowOpacity: interpolate(scrollY.value, [0, 250, 260], [0, 0, 0.20], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [0, 350 - navbar], [0, -350 + navbar], 'clamp') },
      ],
    })),
    logo: useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, 250], [1, 0], Extrapolate.CLAMP),
    })),
    lottie: useAnimatedProps(() => ({
      progress: scrollY.value
        ? interpolate(scrollY.value, [-100, 0, 250], [0.4, 0.5, 0.6], 'clamp')
        : withTiming(interpolate(loaded.value, [0, 1], [0.1, 0.5], 'clamp'), { duration: 2500 }),
    })),
    text: useAnimatedStyle(() => ({
      top: 10,
      transform: [
        { scale: interpolate(scrollY.value, [0, 250, 260], [1, 1, 0.90], Extrapolate.CLAMP) },
        { translateY: interpolate(scrollY.value, [-100, 0], [10, 0], 'clamp') },
      ],
    })),
  };

  // Styles
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    lottie: {
      bottom: 2,
      height: '109%',
    },
    scrollView: {
      paddingTop: 350,
      borderRadius: 30,
    },
    searchButton: {
      width: 60,
      height: 60,
      right: margin,
      bottom: margin,
      borderRadius: 60,
      position: 'absolute',
      backgroundColor: colors.button,
    },
    sharedElement: {
      opacity: 0.5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    plusIcon: {
      top: 3,
      color: colors.text,
    },
  });

  // Render all the lists
  return (
    <View style={styles.screen}>
      <Animated.View style={anims.header}>
        <Animated.View style={anims.logo}>
          <LottieViewAnimated source={studies} style={styles.lottie} animatedProps={anims.lottie} />
        </Animated.View>
        <Animated.View style={anims.text}>
          <Text size={21}>
            {`${getGreeting()}, `}
            <Text size={21} bold>Himanshu</Text>
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        scrollEventThrottle={8}
        onScroll={scrollHandler}
        contentContainerStyle={styles.scrollView}
      >
        <List books={reading} title="Reading" navigation={navigation} />
        <List books={completed} title="Completed" navigation={navigation} />
        <List books={wishlist} title="Wishlist" navigation={navigation} />
      </Animated.ScrollView>

      <SharedElement id="search">
        <View style={[styles.searchButton, styles.sharedElement]} />
      </SharedElement>
      <Button onPress={searchBooks} style={styles.searchButton}>
        <AntDesign size={21} name="search1" style={styles.plusIcon} />
      </Button>
    </View>
  );
}

export default React.memo(BookList);
