import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Alert, Image, StyleSheet, Pressable, Keyboard,
} from 'react-native';
import Animated, {
  interpolate, Extrapolate, withTiming, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import Text from '../components/Text';
import Book from '../components/SearchBook';
import { useBooksState } from '../BookStore';
import { useModalDispatch } from '../components/StatusModal';

const bookImg = require('../images/books.png');

// Default screen
function BookSearchScreen({ navigation }) {
  const {
    colors, height, margin, status,
  } = useTheme();
  const setModal = useModalDispatch();
  const bookList = useBooksState();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const scrollY = useSharedValue(0);
  const loaded = useSharedValue(0);

  // animate on screen load
  const onLayout = () => {
    loaded.value = withTiming(1);
  };

  // scroll handler
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // go to home screen
  const goBack = () => {
    loaded.value = withTiming(0);
    Haptics.selectionAsync();
    navigation.goBack();
  };

  // view book details
  // hide on current screen
  const bookDetails = (book) => {
    Haptics.selectionAsync();
    navigation.push('BookDetails', { book });
  };

  // edit selected book
  const editStatus = (book) => {
    setModal((draft) => {
      draft.book = book;
    });
    Keyboard.dismiss();
    Haptics.selectionAsync();
  };

  // search query
  useEffect(() => {
    if (query.length > 0) {
      axios.get(`https://www.goodreads.com/book/auto_complete?format=json&q=${query}`)
        .then((resp) => {
          const bks = resp.data.map((book) => ({
            ...book,
            imageUrl: book.imageUrl.replace(/_..../, '_SY475_'),
          }));
          setBooks(bks);
        })
        .catch((error) => {
          Alert.alert('Failed to get books', error);
        });
    }
  }, [query]);

  // animated styles
  const anims = {
    search: useAnimatedStyle(() => ({
      zIndex: 10,
      alignItems: 'center',
      flexDirection: 'row',
      paddingTop: status,
      padding: margin / 2,
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      shadowOpacity: interpolate(scrollY.value, [0, 20], [0, 0.75], Extrapolate.CLAMP),
    })),
    scrollView: useAnimatedStyle(() => ({
      opacity: interpolate(loaded.value, [0, 1], [0, 1], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(loaded.value, [0, 1], [50, 0], Extrapolate.CLAMP) },
      ],
    })),
  };

  // Other styles
  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sharedElement: {
      flex: 1,
      height: 40,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 15,
      borderRadius: 20,
      color: colors.text,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.background,
      backgroundColor: colors.card,
    },
    saveButton: {
      width: 60,
      textAlign: 'right',
      color: '#888888',
    },
    placeholderBox: {
      marginTop: margin * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderImg: {
      width: '55%',
      height: height / 3,
    },
    placeholderText: {
      marginVertical: margin,
      paddingHorizontal: margin * 3,
    },
    scrollContainer: {
      padding: margin,
    },
  });

  // empty screen placeholder
  const PlaceHolder = () => (
    <View style={styles.placeholderBox}>
      <Image source={bookImg} resizeMode="contain" style={styles.placeholderImg} />
      <Text center style={styles.placeholderText}>
        You can search by book title, author, keywords etc...
      </Text>
    </View>
  );

  // render search page
  return (
    <View onLayout={onLayout} style={styles.screen}>
      <Animated.View style={anims.search}>
        <SharedElement style={styles.sharedElement} id="search">
          <TextInput
            autoFocus
            value={query}
            autoCorrect={false}
            onChangeText={(text) => setQuery(text)}
            placeholder="Find your next book..."
            style={styles.searchInput}
          />
        </SharedElement>
        <Pressable onPress={goBack}>
          <Text bold style={styles.saveButton}>Done</Text>
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={1}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        style={anims.scrollView}
      >
        {!books.length && <PlaceHolder />}
        {books.map((book) => (
          <Pressable
            key={book.bookId}
            onPress={() => bookDetails(book)}
            onLongPress={() => editStatus(book)}
          >
            <Book book={book} bookList={bookList} />
          </Pressable>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

export default React.memo(BookSearchScreen);
