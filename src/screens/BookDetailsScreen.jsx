/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, Alert, StatusBar, Pressable,
} from 'react-native';
import Animated, {
  interpolate, withTiming, runOnJS,
  useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { Modalize } from 'react-native-modalize';
import { AntDesign } from '@expo/vector-icons';
import { parse } from 'fast-xml-parser';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import Text from '../components/Text';
import List from '../components/BookList';
import Button from '../components/Button';
import BookHeader from '../components/BookHeader';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Get icon for status button
const getIcon = (stat) => {
  switch (stat) {
    case 'Reading':
      return 'rocket1';
    case 'Completed':
      return 'Trophy';
    case 'Wishlist':
      return 'book';
    default:
      return 'plus';
  }
};

// Default screen
function BookDetails({ navigation, route }) {
  const { book } = route.params;
  const [related, setRelated] = useState([]);
  const [bookList, setBookList] = useState([]);
  const [fullBook, setFullBook] = useState(null);
  const [author, setAuthor] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const panRef = useRef();
  const sheetRef = useRef();
  const loaded = useSharedValue(0);
  const y = useSharedValue(0);
  const x = useSharedValue(0);
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

  // Go back to previous screen
  const goBack = () => {
    navigation.goBack();
    Haptics.selectionAsync();
  };

  // Open book lists sheet
  const openSheet = () => {
    Haptics.selectionAsync();
    sheetRef.current?.open();
  };

  // Close book list sheet
  const closeSheet = () => {
    Haptics.notificationAsync('success');
    sheetRef.current?.close();
  };

  // Add book to list
  const addBook = (list) => {
    // Find book in list and update
    const item = bookList.find((b) => b.bookId === book.bookId);
    if (item) {
      setBookList((arr) => {
        arr.splice(bookList.indexOf(item), 1);
        if (list === 'Remove') {
          return [...arr];
        }
        return [{ ...item, status: list }, ...arr];
      });
    } else {
      // Add to list with proper status
      setBookList((arr) => [{ ...book, status: list }, ...arr]);
    }

    closeSheet();
  };

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler(({ contentOffset }) => {
    scrollY.value = contentOffset.y;
    if (contentOffset.y <= 0 && !enabled) {
      runOnJS(setEnabled)(true);
    }
    if (contentOffset.y > 0 && enabled) {
      runOnJS(setEnabled)(false);
    }
  });

  // Pan gesture handler
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (e, ctx) => {
      ctx.moved = Math.max(ctx.startY + e.translationY, ctx.startX + e.translationX);
      ctx.velocity = Math.max(e.velocityX, e.velocityY);
      y.value = ctx.startY + e.translationY;
      x.value = ctx.startX + e.translationX;

      // closing screen? do it!
      if ((ctx.moved >= 75 || ctx.velocity >= 750) && !closing.value) {
        closing.value = 1;
        runOnJS(goBack)();
      }
    },
    onEnd: (e, ctx) => {
      if (ctx.moved < 75 && ctx.velocity < 750) {
        y.value = withTiming(0);
        x.value = withTiming(0);
      }
    },
  });

  // Load book details
  useEffect(() => {
    loadData();

    // Related Books
    axios.get(`https://www.goodreads.com/book/auto_complete?format=json&q=${book.author.name}`)
      .then((resp) => {
        const bks = resp.data.filter((bk, i, arr) => {
          arr[i].imageUrl = bk.imageUrl.replace(/_..../, '_SY475_');
          return (book.bookId !== bk.bookId);
        });
        setRelated(bks);
      })
      .catch((error) => {
        Alert.alert('Failed to get books', error);
      });

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
        { translateX: x.value },
        { translateY: y.value },
        { scale: interpolate(Math.max(y.value, x.value), [0, 75], [1, 0.9], 'clamp') },
      ],
    })),
    scrollView: useAnimatedStyle(() => ({
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: interpolate(Math.max(y.value, x.value), [0, 10], [0, 40], 'clamp'),
    })),
    details: useAnimatedStyle(() => ({
      opacity: loaded.value,
      transform: [
        { translateY: interpolate(loaded.value, [0, 1], [20, 0], 'clamp') },
      ],
    })),
  };

  // Styles
  const styles = {
    closeIcon: {
      zIndex: 10,
      top: margin,
      right: margin,
      opacity: 0.75,
      color: colors.text,
      position: 'absolute',
    },
    scrollContainer: {
      paddingTop: HEADER,
      paddingBottom: status + 50,
    },
    detailsBox: {
      borderRadius: 10,
      flexDirection: 'row',
      marginHorizontal: margin,
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
      marginHorizontal: margin,
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
      margin,
      lineHeight: 25,
      textAlign: 'justify',
    },
    addButton: {
      width: 60,
      height: 60,
      right: margin,
      bottom: margin,
      borderRadius: 60,
      position: 'absolute',
      backgroundColor: colors.button,
    },
    addIcon: {
      top: 3,
    },
    modal: {
      padding: margin,
      borderRadius: 12,
      paddingBottom: status,
      backgroundColor: colors.card,
    },
    flexRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    marginB: {
      marginBottom: margin,
    },
    iconBtn: {
      padding: 0,
      backgroundColor: colors.card,
    },
    iconLeft: {
      fontSize: 21,
      color: colors.text,
      marginRight: margin,
    },
  };

  // Find book in list
  const item = bookList.find((b) => b.bookId === book.bookId);

  // Render book details
  return (
    <>
      <PanGestureHandler
        ref={panRef}
        failOffsetY={-5}
        failOffsetX={-5}
        activeOffsetY={5}
        activeOffsetX={25}
        onHandlerStateChange={gestureHandler}
      >
        <Animated.View style={anims.screen}>
          <StatusBar hidden={useIsFocused()} animated />
          <BookHeader scrollY={scrollY} book={book} />
          <AntDesign size={27} name="close" onPress={goBack} style={styles.closeIcon} />

          <Animated.View style={anims.scrollView}>
            <AnimatedScrollView
              waitFor={enabled ? panRef : undefined}
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
                <Pressable onPress={openSheet} style={styles.detailsRow}>
                  <Text center size={13}>STATUS</Text>
                  <Text bold color={colors.primary} style={styles.subDetails}>{item ? item.status : '-'}</Text>
                </Pressable>
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
                <Text size={16} numberOfLines={10} style={styles.aboutBook}>
                  {fullBook?.description.replace(/(<([^>]+)>)/ig, ' ')}
                </Text>
                <List books={related} title="Related Books" navigation={navigation} />
              </Animated.View>
            </AnimatedScrollView>

            <Button onPress={openSheet} style={styles.addButton}>
              <AntDesign size={21} name={getIcon(item?.status)} style={styles.addIcon} />
            </Button>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>

      <Modalize ref={sheetRef} threshold={50} adjustToContentHeight>
        <View style={styles.modal}>
          <View style={[styles.flexRow, styles.marginB]}>
            <Text bold size={20}>Add To</Text>
            <Text bold onPress={closeSheet}>Done</Text>
          </View>
          <Pressable onPress={() => addBook('Reading')} style={[styles.flexRow, styles.marginB]}>
            <AntDesign.Button onPress={() => addBook('Reading')} name="rocket1" style={styles.iconBtn} iconStyle={styles.iconLeft}>
              <Text size={17}>Reading</Text>
            </AntDesign.Button>
            <AntDesign size={21} color={colors.text} name={item?.status === 'Reading' ? 'check' : ''} />
          </Pressable>
          <Pressable onPress={() => addBook('Completed')} style={[styles.flexRow, styles.marginB]}>
            <AntDesign.Button onPress={() => addBook('Completed')} name="Trophy" style={styles.iconBtn} iconStyle={styles.iconLeft}>
              <Text size={17}>Completed</Text>
            </AntDesign.Button>
            <AntDesign size={21} color={colors.text} name={item?.status === 'Completed' ? 'check' : ''} />
          </Pressable>
          <Pressable onPress={() => addBook('Wishlist')} style={[styles.flexRow, styles.marginB]}>
            <AntDesign.Button onPress={() => addBook('Wishlist')} name="book" style={styles.iconBtn} iconStyle={styles.iconLeft}>
              <Text size={17}>Wishlist</Text>
            </AntDesign.Button>
            <AntDesign size={21} color={colors.text} name={item?.status === 'Wishlist' ? 'check' : ''} />
          </Pressable>
          <Pressable onPress={() => addBook('Remove')}>
            <Text center size={16} color="#ff3b30">Remove</Text>
          </Pressable>
        </View>
      </Modalize>
    </>
  );
}

export default React.memo(BookDetails);
