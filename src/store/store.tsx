import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { setupListeners } from "@reduxjs/toolkit/query";
import { counterSlice } from "@/slice/counterSlice";
import newAuthReducer from "@/slice/newAuthSlice"
import { apiSlice } from "@/slice/requestSlice";


const reducers = combineReducers({
   counter: counterSlice.reducer,
   newAuth: newAuthReducer,
    [apiSlice.reducerPath] : apiSlice.reducer,
  });

const persistConfig = {
key: "root",
storage,
whiteList: ["auth", "newAuth"],
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