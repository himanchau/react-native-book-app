import React, { forwardRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import * as Haptics from 'expo-haptics';

import Text from './Text';
import { useBookDispatch } from '../BookStore';

// Themeable Button
function StatusModal({ books, book }, ref) {
  const { colors, margin, status } = useTheme();
  const dispatch = useBookDispatch();

  const styles = StyleSheet.create({
    modal: {
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    content: {
      padding: margin,
      borderRadius: 25,
      paddingBottom: status,
      backgroundColor: colors.card,
    },
    bookTitle: {
      opacity: 0.5,
    },
    flexRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    marginB: {
      marginBottom: margin,
    },
    iconLeft: {
      fontSize: 21,
      color: colors.text,
      marginRight: margin,
    },
    statusText: {
      marginRight: 'auto',
    },
  });

  // Close book list sheet
  const closeSheet = () => {
    Haptics.notificationAsync('success');
    ref.current?.close();
  };

  // find book to update or remove from list
  const updateList = (list) => {
    const index = books.findIndex((b) => b.bookId === book.bookId);
    if (index === -1) {
      dispatch({ type: 'ADD_BOOK', payload: { book, list } });
    } else if (list === 'Remove') {
      dispatch({ type: 'REMOVE_BOOK', payload: { book, list } });
    } else {
      dispatch({ type: 'UPDATE_BOOK', payload: { book, list } });
    }
    closeSheet();
  };

  // no-book, can't render
  if (book === null) return null;

  // find the book in lists
  let item = books.find((b) => b.bookId === book.bookId);
  if (!item) item = book;

  return (
    <Modalize modalStyle={styles.modal} ref={ref} threshold={50} adjustToContentHeight>
      <View style={styles.content}>
        <View style={[styles.flexRow]}>
          <Text bold size={20}>
            {item.status ? 'Update List' : 'Add to List'}
          </Text>
          <Text bold onPress={closeSheet}>Done</Text>
        </View>
        <Text numberOfLines={1} style={[styles.bookTitle, styles.marginB]}>
          {item.bookTitleBare}
        </Text>
        <Pressable onPress={() => updateList('Reading')} style={[styles.flexRow, styles.marginB]}>
          <AntDesign name="rocket1" style={styles.iconLeft} />
          <Text size={17} style={styles.statusText}>Reading</Text>
          <AntDesign size={21} color={colors.text} name={item.status === 'Reading' ? 'check' : ''} />
        </Pressable>
        <Pressable onPress={() => updateList('Completed')} style={[styles.flexRow, styles.marginB]}>
          <AntDesign name="Trophy" style={styles.iconLeft} />
          <Text size={17} style={styles.statusText}>Completed</Text>
          <AntDesign size={21} color={colors.text} name={item.status === 'Completed' ? 'check' : ''} />
        </Pressable>
        <Pressable onPress={() => updateList('Wishlist')} style={[styles.flexRow, styles.marginB]}>
          <AntDesign name="book" style={styles.iconLeft} />
          <Text size={17} style={styles.statusText}>Wishlist</Text>
          <AntDesign size={21} color={colors.text} name={item.status === 'Wishlist' ? 'check' : ''} />
        </Pressable>
        <Pressable onPress={() => updateList('Remove')}>
          <Text center size={16} color="#ff3b30">Remove</Text>
        </Pressable>
      </View>
    </Modalize>
  );
}

export default React.memo(forwardRef(StatusModal));
