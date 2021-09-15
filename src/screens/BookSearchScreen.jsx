import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Alert, StyleSheet, Pressable, Keyboard,
} from 'react-native';
import Animated, {
  interpolate, Extrapolate, withTiming, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { useTheme } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import Text from '../components/Text';
import Book from '../components/SearchBook';
import { useBooksState } from '../BookStore';
import { setModal } from '../components/StatusModal';

const stack = require('../anims/stack.json');

// Default screen
function BookSearchScreen({ navigation }) {
  const {
    colors, height, margin, status, navbar,
  } = useTheme();
  const { books: bookList } = useBooksState();
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
    setModal(book);
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
      height: navbar,
      alignItems: 'flex-end',
      flexDirection: 'row',
      paddingTop: status,
      paddingBottom: 6,
      paddingHorizontal: margin / 2,
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
      height: 38,
    },
    searchIcon: {
      width: 30,
      opacity: 0.3,
    },
    searchInput: {
      flex: 1,
      height: 38,
      fontSize: 15,
      borderRadius: 20,
      color: colors.text,
      paddingHorizontal: margin,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textInput: {
      height: 38,
      width: '100%',
      fontSize: 16,
    },
    saveButton: {
      width: 60,
      height: 38,
      lineHeight: 38,
      textAlign: 'right',
      color: '#888888',
    },
    placeholderBox: {
      alignItems: 'center',
      marginTop: margin * 2,
      justifyContent: 'center',
    },
    placeholderImg: {
      opacity: 0.95,
      height: height / 3.5,
      marginBottom: margin,
    },
    placeholderText: {
      fontSize: 15,
      paddingHorizontal: margin * 3,
    },
    scrollContainer: {
      padding: margin,
    },
  });

  // empty screen placeholders
  const PlaceHolder = () => (
    <View style={styles.placeholderBox}>
      <LottieView
        autoPlay
        loop={false}
        speed={0.8}
        source={stack}
        style={styles.placeholderImg}
      />
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
          <View size={15} style={styles.searchInput}>
            <View style={styles.searchIcon}>
              <AntDesign color={colors.text} name="search1" size={15} />
            </View>
            <TextInput
              autoFocus
              width="100%"
              value={query}
              autoCorrect={false}
              style={styles.textInput}
              onChangeText={(text) => setQuery(text)}
              placeholder="Find your next book..."
            />
          </View>
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
