import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import stockReducer from './slices/stockSlice';
import notificationReducer from './slices/notificationSlice';
import supplierReducer from './slices/supplierSlice';
import productReducer from './slices/productSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        stock: stockReducer,
        notifications: notificationReducer,
        suppliers: supplierReducer,
        products: productReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
