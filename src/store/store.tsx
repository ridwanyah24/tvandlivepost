import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import { counterSlice } from "@/slice/counterSlice";
import { apiSlice } from "@/slice/requestSlice";
import adminAuth from "@/slice/authAdmin"

const reducers = combineReducers({
   counter: counterSlice.reducer,
   authAdmin: adminAuth,
    [apiSlice.reducerPath] : apiSlice.reducer,
  });

const persistConfig = {
key: "root",
storage,
whiteList: ["authAdmin"],
blacklist: [apiSlice.reducerPath], // Prevent persisting the request slice
};
  

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore redux-persist actions
          ignoredActions: [
            "persist/PERSIST",
            "persist/REHYDRATE",
            "persist/PAUSE",
            "persist/PURGE",
            "persist/FLUSH",
            "persist/REGISTER",
          ],
        },
      }).concat(apiSlice.middleware),
  });

setupListeners(store.dispatch);

// Type exports
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistor
export const persistor = persistStore(store);