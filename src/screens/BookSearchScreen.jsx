import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Alert, Image, StyleSheet, Pressable,
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

const bookImg = require('../images/books.png');

// Default screen
function SearchScreen({ navigation, route }) {
  const { bookList } = route.params;
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const scrollY = useSharedValue(0);
  const loaded = useSharedValue(0);
  const {
    colors, height, margin, status,
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
    loaded.value = withTiming(1, { duration: 450 });
  }, []);

  // Animated styles
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
