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
  <View style={{ width: 85, flexDirection: 'row', justifyContent: 'space-between' }}>
    <FontAwesome size={16} name={rating < 0.5 ? 'star-o' : rating < 0.5 ? 'star-half-o' : 'star'} color="#f1c40f" />
    <FontAwesome size={16} name={rating < 1.5 ? 'star-o' : rating < 1.5 ? 'star-half-o' : 'star'} color="#f1c40f" />
    <FontAwesome size={16} name={rating < 2.5 ? 'star-o' : rating < 2.5 ? 'star-half-o' : 'star'} color="#f1c40f" />
    <FontAwesome size={16} name={rating < 3.5 ? 'star-o' : rating < 3.5 ? 'star-half-o' : 'star'} color="#f1c40f" />
    <FontAwesome size={16} name={rating < 4.5 ? 'star-o' : rating < 4.5 ? 'star-half-o' : 'star'} color="#f1c40f" />
  </View>
));

// What the button text should be
const ListText = React.memo(({ list, book }) => {
  const move = useSharedValue(0);
  const item = list.find((b) => b.bookId === book.bookId);
  move.value = item ? 1 : 0;

  // animate text up
  const anims = useAnimatedStyle(() => ({
    opacity: withTiming(move.value ? 1 : 0),
    height: withTiming(move.value ? 25 : 0),
  }));

  const styles = StyleSheet.compose({
    color: '#27ae60',
  });

  return (
    <Animated.View style={anims}>
      <Text bold size={13} style={styles}>
        {item?.status}
      </Text>
    </Animated.View>
  );
});

// Render book
const Book = React.memo(({ book, list }) => {
  const { margin } = useTheme();
  const navigation = useNavigation();
  const move = useSharedValue(0);

  // View book details
  const bookDetails = () => {
    Haptics.selectionAsync();
    navigation.navigate('BookDetails', { book });
  };

  // Animated styles
  const imageStyles = useAnimatedStyle(() => ({
    width: 120,
    height: 180,
    borderRadius: 10,
    transform: [
      { translateX: interpolate(move.value, [0, 1], [0, margin / 2], Extrapolate.CLAMP) },
    ],
  }));

  // Styles
  const styles = StyleSheet.create({
    bookBox: {
      flexDirection: 'row',
      marginBottom: margin * 1.5,
    },
    bookCover: {
      shadowRadius: 5,
      shadowOpacity: 0.5,
      shadowOffset: { width: 5, height: 5 },
    },
    bookDetails: {
      flex: 1,
      justifyContent: 'center',
      paddingLeft: margin * 1.5,
    },
    bookAuthor: {
      marginVertical: margin / 2,
    },
  });

  // Render Book
  return (
    <Pressable onPress={bookDetails} style={styles.bookBox}>
      <View style={styles.bookCover}>
        <SharedElement id={book.bookId}>
          <Animated.Image style={imageStyles} source={{ uri: book.imageUrl }} />
        </SharedElement>
      </View>
      <View style={styles.bookDetails}>
        <ListText list={list} book={book} />
        <Text bold size={17} numberOfLines={2}>
          {book.bookTitleBare}
        </Text>
        <Text size={14} style={styles.bookAuthor}>
          {book.author.name}
        </Text>
        <Rating rating={book.avgRating} />
      </View>
    </Pressable>
  );
});

// Default screen
function SearchScreen({ navigation, route }) {
  const list = route.params?.bookList || [];
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
    navigation.navigate('BookList', { bookList: list });
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
        {books.map((book) => <Book key={book.bookId} list={list} book={book} />)}
      </Animated.ScrollView>
    </View>
  );
}

export default React.memo(SearchScreen);
