/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Alert, Image, StyleSheet, Pressable,
} from 'react-native';
import Animated, {
  interpolate, Extrapolate, withTiming, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';

import Text from '../components/Text';

const bookImg = require('../images/books.png');

// Star rating
const Rating = React.memo(({ rating }) => (
  <View style={{ width: 90, flexDirection: 'row', justifyContent: 'space-between' }}>
    <FontAwesome size={16} name={rating < 0.5 ? 'star-o' : rating < 0.5 ? 'star-half-o' : 'star'} color="#f39c12" />
    <FontAwesome size={16} name={rating < 1.5 ? 'star-o' : rating < 1.5 ? 'star-half-o' : 'star'} color="#f39c12" />
    <FontAwesome size={16} name={rating < 2.5 ? 'star-o' : rating < 2.5 ? 'star-half-o' : 'star'} color="#f39c12" />
    <FontAwesome size={16} name={rating < 3.5 ? 'star-o' : rating < 3.5 ? 'star-half-o' : 'star'} color="#f39c12" />
    <FontAwesome size={16} name={rating < 4.5 ? 'star-o' : rating < 4.5 ? 'star-half-o' : 'star'} color="#f39c12" />
  </View>
));

// Render book
const Book = React.memo(({ book, bookList }) => {
  const { margin, colors, normalize } = useTheme();
  const navigation = useNavigation();
  const BOOKW = normalize(120, 150);
  const BOOKH = BOOKW * 1.5;
  const item = bookList.find((b) => b.bookId === book.bookId);

  // View book details
  const bookDetails = () => {
    Haptics.selectionAsync();
    navigation.push('BookDetails', { book });
  };

  // Styles
  const styles = StyleSheet.create({
    bookBox: {
      flexDirection: 'row',
      marginBottom: margin * 1.5,
    },
    imgBox: {
      borderRadius: 10,
      shadowRadius: 3,
      shadowOpacity: 0.3,
      shadowOffset: { width: 3, height: 3 },
    },
    bookImg: {
      width: BOOKW,
      height: BOOKH,
      borderRadius: 10,
    },
    bookDetails: {
      flex: 1,
      justifyContent: 'center',
      paddingLeft: margin * 1.5,
    },
    bookAuthor: {
      marginVertical: margin / 4,
    },
  });

  // Render Book
  return (
    <Pressable onPress={bookDetails} style={styles.bookBox}>
      <SharedElement id={book.bookId}>
        <View style={styles.imgBox}>
          <Image style={styles.bookImg} source={{ uri: book.imageUrl }} />
        </View>
      </SharedElement>

      <View style={styles.bookDetails}>
        {item?.status && (
          <Text bold color={colors.primary}>
            {item.status}
          </Text>
        )}
        <Text bold size={17} numberOfLines={2}>
          {book.bookTitleBare}
        </Text>
        <Text style={styles.bookAuthor}>
          {book.author.name}
        </Text>
        <Rating rating={book.avgRating} />
      </View>
    </Pressable>
  );
});

// Default screen
function SearchScreen({ navigation, route }) {
  const { bookList } = route.params;
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const scrollY = useSharedValue(0);
  const loaded = useSharedValue(0);
  const {
    colors, width, height, margin, status,
  } = useTheme();

  // Scroll Handler
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Return with book list
  const goBack = () => {
    loaded.value = withTiming(0);
    Haptics.selectionAsync();
    navigation.goBack();
  };

  // Search
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

  // Loaded animation fade in
  useEffect(() => {
    loaded.value = withTiming(1, { duration: 600 });
  }, []);

  // Animated styles
  const anims = {
    search: useAnimatedStyle(() => ({
      zIndex: 10,
      alignItems: 'center',
      flexDirection: 'row',
      paddingTop: status,
      paddingBottom: margin / 2,
      paddingHorizontal: margin,
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      opacity: interpolate(loaded.value, [0.75, 1], [0, 1], Extrapolate.CLAMP),
      shadowOpacity: interpolate(scrollY.value, [0, 20], [0, 0.75], Extrapolate.CLAMP),
    })),
    scrollView: useAnimatedStyle(() => ({
      opacity: interpolate(loaded.value, [0.5, 1], [0, 1], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(loaded.value, [0, 0.75], [50, 0], Extrapolate.CLAMP) },
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
      top: -20,
      height: 40,
      borderRadius: 40,
      position: 'absolute',
      width: width - margin * 2 - 70,
      backgroundColor: colors.card,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 15,
      borderRadius: 22,
      color: colors.text,
      paddingHorizontal: 20,
      backgroundColor: colors.card,
    },
    saveButton: {
      width: 70,
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

  // Empty screen placeholder
  const PlaceHolder = () => (
    <View style={styles.placeholderBox}>
      <Image source={bookImg} resizeMode="contain" style={styles.placeholderImg} />
      <Text center style={styles.placeholderText}>
        You can search by book title, author, keywords etc...
      </Text>
    </View>
  );

  // Render search page
  return (
    <View style={styles.screen}>
      <Animated.View style={anims.search}>
        <SharedElement id="search">
          <View style={styles.sharedElement} />
        </SharedElement>
        <TextInput
          autoFocus
          value={query}
          autoCorrect={false}
          onChangeText={(text) => setQuery(text)}
          placeholder="Search"
          style={styles.searchInput}
        />
        <Pressable onPress={goBack}>
          <Text bold style={styles.saveButton}>Done</Text>
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={8}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        style={anims.scrollView}
      >
        {!books.length && <PlaceHolder />}
        {books.map((book) => <Book key={book.bookId} book={book} bookList={bookList} />)}
      </Animated.ScrollView>
    </View>
  );
}

export default React.memo(SearchScreen);
