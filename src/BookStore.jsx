import AsyncStorage from '@react-native-async-storage/async-storage';
import { proxy, useSnapshot } from 'valtio';

// global state
const state = proxy({
  books: [],
});

// load books from async storage once
async function loadBooks() {
  const json = await AsyncStorage.getItem('@lists');
  const data = json ? JSON.parse(json) : [];
  state.books = data;
}
loadBooks();

// save books to async storage
async function saveBooks() {
  AsyncStorage.setItem('@lists', JSON.stringify(state.books));
}

// export fruit state as snapshot
export const useBooksState = () => useSnapshot(state);

// export functions to update state
export const setBookState = () => ({
  addBook: (book, status) => {
    state.books.unshift({ ...book, status });
    saveBooks();
  },
  updateBook: (book, status) => {
    const index = state.books.findIndex((b) => b.bookId === book.bookId);
    if (index !== -1) state.books[index] = { ...book, status };
    saveBooks();
  },
  removeBook: (book) => {
    const index = state.books.findIndex((b) => b.bookId === book.bookId);
    if (index !== -1) state.books.splice(index, 1);
    saveBooks();
  },
});
