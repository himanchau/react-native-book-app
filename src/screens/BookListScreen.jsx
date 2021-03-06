import React, { useState, useEffect } from 'react';
import { View, Pressable, Platform } from 'react-native';
import Animated, {
  interpolate, useAnimatedStyle, useSharedValue, useAnimatedScrollHandler, useAnimatedProps,
} from 'react-native-reanimated';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SharedElement } from 'react-navigation-shared-element';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

import Text from '../components/Text';
import List from '../components/BookList';

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

// Default screen
function BookList({ navigation }) {
  const {
    dark, width, colors, margin, navbar, normalize,
  } = useTheme();
  const HEADER = normalize(300, 400);
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

  // Styles
  const styles = {
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: useAnimatedStyle(() => ({
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: HEADER,
      paddingTop: navbar,
      shadowRadius: 4,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'flex-end',
      shadowOffset: (Platform.OS === 'ios') ? { height: 2, width: 0 } : {},
      backgroundColor: colors.background,
      shadowOpacity: interpolate(scrollY.value, [0, HEADER - 100, HEADER - 80], [0, 0, 0.15], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [0, HEADER - navbar], [0, -HEADER + navbar], 'clamp') },
      ],
    })),
    logo: useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, HEADER - 100], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [-200, 0], [50, 0], 'clamp') },
      ],
    })),
    lottie: {
      alignSelf: 'center',
      height: '110%',
      marginLeft: 10,
      opacity: dark ? 0.8 : 1,
    },
    lottieProps: useAnimatedProps(() => ({
      speed: 0.5,
      autoPlay: true,
      // progress: scrollY.value
      //   ? interpolate(scrollY.value, [-200, 0, 200], [0, 0.5, 1], 'clamp')
      //   : withTiming(1, { duration: 5000 }),
    })),
    welcome: useAnimatedStyle(() => ({
      transform: [
        { translateY: interpolate(scrollY.value, [-200, 0], [200, 0], 'clamp') },
      ],
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
      marginRight: 10,
    },
    searchText: {
      opacity: 0.3,
    },
    scrollView: {
      paddingTop: HEADER,
    },
  };

  // Render all the lists
  return (
    <View style={styles.screen}>
      <Animated.View style={styles.header}>
        <Animated.View style={styles.logo}>
          <LottieViewAnimated
            source={studies}
            style={styles.lottie}
            animatedProps={styles.lottieProps}
          />
        </Animated.View>
        <Animated.View style={styles.welcome}>
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
    </View>
  );
}

export default React.memo(BookList);
