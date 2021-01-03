/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import {
  View, Image, StyleSheet, Alert, StatusBar,
} from 'react-native';
import Animated, {
  withTiming, interpolate, Extrapolate, runOnJS,
  useAnimatedStyle, useSharedValue, useAnimatedScrollHandler, useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { SharedElement } from 'react-navigation-shared-element';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { parse } from 'fast-xml-parser';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import Text from '../components/Text';
import Button from '../components/Button';

// Load a single book
const BookHeader = React.memo(({
  scrollY, book, x, y, navigation,
}) => {
  const { width, margin, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const moving = useSharedValue(0);
  const closing = useSharedValue(0);
  const BOOKW = width / 2.8;
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
      shadowRadius: 5,
      shadowOpacity: 0.25,
      alignItems: 'center',
      shadowOffset: { width: 5, height: 5 },
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
    cover: {
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
            <Image style={styles.cover} source={{ uri: book.imageUrl }} />
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
});

// Default screen
function BookDetails({ navigation, route }) {
  const book = route.params?.book;
  const insets = useSafeAreaInsets();
  const [bookList, setBookList] = useState([]);
  const [fullBook, setFullBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const scrollY = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const {
    margin, width, dark, colors,
  } = useTheme();

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
  });

  // Load book details
  useEffect(() => {
    loadData();
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
      })
      .catch(() => {
        Alert.alert('Failed to get books!');
      });
  }, [book]);

  // Screen anims
  const screenStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: colors.background,
    opacity: interpolate(y.value, [0, 50], [1, 0], Extrapolate.CLAMP),
  }));

  // Styles
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
    },
    closeIcon: {
      zIndex: 10,
      top: margin,
      right: margin,
      color: colors.text,
      position: 'absolute',
    },
    scrollContainer: {
      padding: margin,
      paddingTop: width + insets.top + margin,
      paddingBottom: insets.bottom + margin + 50,
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
      width: 60,
      height: 60,
      borderRadius: 50,
      marginRight: margin,
    },
    aboutBook: {
      lineHeight: 25,
      marginTop: margin,
      textAlign: 'justify',
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
    <View style={styles.screen}>
      <StatusBar hidden={useIsFocused()} />
      <BookHeader scrollY={scrollY} x={x} y={y} book={book} navigation={navigation} />
      <AntDesign size={27} name="close" onPress={() => navigation.goBack()} style={styles.closeIcon} />

      <Animated.View style={screenStyle}>
        <Animated.ScrollView
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
              <Text bold style={styles.subDetails}>{item ? item.status : '-'}</Text>
            </View>
          </View>

          {author && (
            <View style={styles.authorBox}>
              <Image source={{ uri: author.image_url }} style={styles.authorImage} />
              <View>
                <Text bold size={17}>{author.name}</Text>
                <Text numberOfLines={1}>{author.hometown}</Text>
              </View>
            </View>
          )}

          {fullBook && (
            <Text size={16} style={styles.aboutBook}>
              {fullBook.description.replace(/(<([^>]+)>)/ig, '')}
            </Text>
          )}
        </Animated.ScrollView>

        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <Button onPress={addBook}>
            {item ? item.status : 'Add to List'}
          </Button>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

export default React.memo(BookDetails);
