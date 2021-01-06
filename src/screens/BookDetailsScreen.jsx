/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Alert, StatusBar,
} from 'react-native';
import Animated, {
  interpolate, withTiming, runOnJS,
  useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { parse } from 'fast-xml-parser';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import Text from '../components/Text';
import Button from '../components/Button';
import BookHeader from '../components/BookHeader';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Default screen
function BookDetails({ navigation, route }) {
  const book = route.params?.book;
  const [bookList, setBookList] = useState([]);
  const [fullBook, setFullBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const ref = useRef();
  const loaded = useSharedValue(0);
  const y = useSharedValue(0);
  const closing = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const {
    margin, width, dark, colors, normalize, status,
  } = useTheme();
  const HEADER = normalize(width + status, 500) + margin;

  // Save data to async storage
  const saveData = async () => {
    await AsyncStorage.setItem('@lists', JSON.stringify(bookList));
  };

  // Load data from async storage
  const loadData = async () => {
    const json = await AsyncStorage.getItem('@lists');
    const data = json != null ? JSON.parse(json) : null;
    setBookList(data || []);
  };

  // Save data on list change
  useEffect(() => {
    if (bookList.length) {
      saveData();
    }
  }, [bookList]);

  // Add book to list
  const addBook = () => {
    Haptics.selectionAsync();
    let status = 'Reading';

    // Find item and update status if needed
    const item = bookList.find((b) => b.bookId === book.bookId);
    if (item) {
      const index = bookList.indexOf(item);
      switch (item.status) {
        case 'Reading':
          status = 'Completed';
          break;
        case 'Completed':
          status = 'Wishlist';
          break;
        case 'Wishlist':
          status = 'Remove';
          break;
        default:
          status = 'Reading';
          break;
      }
      setBookList((arr) => {
        arr.splice(index, 1);
        if (status === 'Remove') {
          return [...arr];
        }
        return [{ ...item, status }, ...arr];
      });
    } else {
      // Add to the list with reading status
      setBookList((arr) => [{ ...book, status }, ...arr]);
    }
  };

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
    if (event.contentOffset.y <= 0 && !enabled) {
      runOnJS(setEnabled)(true);
    }
    if (event.contentOffset.y > 0 && enabled) {
      runOnJS(setEnabled)(false);
    }
  });

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = y.value;
    },
    onActive: (e, ctx) => {
      y.value = ctx.startY + e.translationY;

      // See if closing screen
      const flung = e.velocityY >= 250 || y.value >= 75;
      if (flung && !closing.value) {
        closing.value = 1;
        runOnJS(navigation.goBack)();
        runOnJS(Haptics.selectionAsync)();
      }
    },
    onEnd: (e) => {
      if (y.value < 75 && e.velocityY < 250) {
        y.value = withTiming(0);
      }
    },
  });

  // Load book details
  useEffect(() => {
    loadData();

    // Book details
    axios.get(`https://www.goodreads.com/book/show/${book.bookId}.xml?key=Bi8vh08utrMY3HAqM9rkWA`)
      .then((resp) => {
        const data = parse(resp.data);
        setFullBook(data?.GoodreadsResponse?.book);
      })
      .catch(() => {
        Alert.alert('Failed to get books!');
      });

    // Author details
    axios.get(`https://www.goodreads.com/author/show.xml?key=Bi8vh08utrMY3HAqM9rkWA&id=${book.author.id}`)
      .then((resp) => {
        const data = parse(resp.data);
        setAuthor(data?.GoodreadsResponse?.author);
        loaded.value = withTiming(1);
      })
      .catch(() => {
        Alert.alert('Failed to get books!');
      });
  }, [book]);

  // Screen anims
  const anims = {
    screen: useAnimatedStyle(() => ({
      flex: 1,
      shadowRadius: 10,
      shadowOpacity: 0.5,
      shadowOffset: { height: 5 },
      transform: [
        { translateY: y.value },
        { scale: interpolate(y.value, [0, 75], [1, 0.90], 'clamp') },
      ],
    })),
    scrollView: useAnimatedStyle(() => ({
      flex: 1,
      borderRadius: 20,
      backgroundColor: colors.background,
    })),
    details: useAnimatedStyle(() => ({
      opacity: loaded.value,
      transform: [
        { translateY: interpolate(loaded.value, [0, 1], [20, 0], 'clamp') },
      ],
    })),
  };

  // Styles
  const styles = StyleSheet.create({
    closeIcon: {
      zIndex: 10,
      top: margin,
      right: margin,
      opacity: 0.75,
      color: colors.text,
      position: 'absolute',
    },
    scrollContainer: {
      padding: margin,
      paddingTop: HEADER,
      paddingBottom: status + margin + 50,
    },
    detailsBox: {
      borderRadius: 10,
      flexDirection: 'row',
      backgroundColor: colors.card,
    },
    detailsRow: {
      flex: 1,
      paddingVertical: margin / 2,
    },
    detailsRowBorder: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: dark ? '#ffffff22' : '#00000011',
    },
    subDetails: {
      fontSize: 15,
      textAlign: 'center',
      marginTop: margin / 4,
    },
    authorBox: {
      marginTop: margin,
      flexDirection: 'row',
      alignItems: 'center',
    },
    authorImage: {
      width: 65,
      height: 65,
      borderRadius: 65,
      marginRight: margin,
    },
    authorDetails: {
      marginTop: 5,
      opacity: 0.75,
      width: width - 120,
    },
    aboutBook: {
      lineHeight: 25,
      marginTop: margin,
    },
    footer: {
      left: 0,
      right: 0,
      bottom: 0,
      position: 'absolute',
      paddingHorizontal: margin,
    },
  });

  // Find book in list
  const item = bookList.find((b) => b.bookId === book.bookId);

  // Render book details
  return (
    <PanGestureHandler
      ref={ref}
      failOffsetY={-5}
      activeOffsetY={5}
      enabled={enabled}
      onGestureEvent={gestureHandler}
    >
      <Animated.View style={anims.screen}>
        <StatusBar hidden={useIsFocused()} />
        <BookHeader scrollY={scrollY} y={y} book={book} navigation={navigation} />
        <AntDesign size={27} name="close" onPress={() => navigation.goBack()} style={styles.closeIcon} />

        <Animated.View style={anims.scrollView}>
          <AnimatedScrollView
            waitFor={enabled ? ref : undefined}
            onScroll={scrollHandler}
            scrollEventThrottle={8}
            contentContainerStyle={styles.scrollContainer}
          >
            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}>
                <Text center size={13}>RATING</Text>
                <Text bold style={styles.subDetails}>{book.avgRating}</Text>
              </View>
              <View style={[styles.detailsRow, styles.detailsRowBorder]}>
                <Text center size={13}>PAGES</Text>
                <Text bold style={styles.subDetails}>{book.numPages}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Text center size={13}>STATUS</Text>
                <Text bold color={colors.primary} style={styles.subDetails}>{item ? item.status : '-'}</Text>
              </View>
            </View>

            <Animated.View style={anims.details}>
              <View style={styles.authorBox}>
                <Image source={{ uri: author?.image_url }} style={styles.authorImage} />
                <View>
                  <Text bold size={17}>{author?.name || '...'}</Text>
                  <Text numberOfLines={2} style={styles.authorDetails}>
                    {author?.about.replace(/(<([^>]+)>)/ig, '')}
                  </Text>
                </View>
              </View>
              <Text size={16} style={styles.aboutBook}>
                {fullBook?.description.replace(/(<([^>]+)>)/ig, '')}
              </Text>
            </Animated.View>
          </AnimatedScrollView>

          <SafeAreaView edges={['bottom']} style={styles.footer}>
            <Button onPress={addBook}>
              {item ? item.status : 'Add to List'}
            </Button>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
}

export default React.memo(BookDetails);
