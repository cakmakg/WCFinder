import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import {
    persistStore, persistReducer, REHYDRATE, FLUSH,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage';
//import eventReducer from "../features/chat/hooks/eventSlice";

const persistConfig = {
    key: 'root',
    storage,
}

const persistedReducer = persistReducer(persistConfig, authReducer)

const store = configureStore({
    reducer: {
        auth: persistedReducer,
        //event:eventReducer
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== "production",
});

export let persistor = persistStore(store)

export default store;