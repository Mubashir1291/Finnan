// import { configureStore } from '@reduxjs/toolkit';
// import { combineReducers } from 'redux';
// import { persistReducer, persistStore } from 'redux-persist';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import UserReducer from './Reducers/userReducer';

// const reducers = combineReducers({
//   user: UserReducer,
// });

// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
//   whitelist: ['user'],
// };

// const persistedReducer = persistReducer(persistConfig, reducers);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: getDefaultMiddleware =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ignore these action types
//         ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//       },
//     }),
// });

// export const persistor = persistStore(store);

// // persistor.purge();
