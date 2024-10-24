'use client';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import userSlice from './reducer/user';
import { ReactNode } from 'react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';

const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 1,
    storage,
    blacklist: ['user'],
  },
  combineReducers({
    user: persistReducer(
      {
        key: 'user',
        storage,
      },
      userSlice
    ),
  })
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 关闭序列化检查
      serializableCheck: false,
    }),
});
export const persistor = persistStore(store);

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

export default store;
