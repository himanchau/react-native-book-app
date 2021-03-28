import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import produce from 'immer';

// create store using zustant & immer
const useStore = create((set) => ({
  books: null,
  set: (fn) => set(produce(fn)),
}));

// load books from async storage once
async function loadBooks(set) {
  const json = await AsyncStorage.getItem('@lists');
  const data = json ? JSON.parse(json) : [];
  set((draft) => {
    draft.books = data;
  });
}

// save books to async storage
async function saveBooks(books) {
  AsyncStorage.setItem('@lists', JSON.stringify(books));
}

// instantiate selectors for perf
const stateSelector = (state) => state.books;
const setSelector = (state) => state.set;

// export store with books
export const useBooksState = () => {
  const books = useStore(stateSelector);
  const set = useStore(setSelector);

  // load from async store
  if (!books) loadBooks(set);

  return books || [];
};

// books state updater
export const useBooksDispatch = () => {
  const set = useStore(setSelector);

  // add book
  const addBook = (book, status) => {
    set((draft) => {
      draft.books.unshift({ ...book, status });
      saveBooks(draft.books);
    });
  };

  // update book
  const updateBook = (book, status) => {
    set((draft) => {
      const index = draft.books.findIndex((b) => b.bookId === book.bookId);
      if (index !== -1) draft.books[index].status = status;
    });
  };

  // remove book
  const removeBook = (book) => {
    set((draft) => {
      const index = draft.books.findIndex((b) => b.bookId === book.bookId);
      if (index !== -1) draft.books.splice(index, 1);
      saveBooks(draft.books);
    });
  };

  return {
    addBook,
    updateBook,
    removeBook,
  };
};
