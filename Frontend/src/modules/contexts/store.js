import { configureStore } from '@reduxjs/toolkit';
import sliceReducer from './slice';

const store = configureStore({
    reducer: {
        app_slice: sliceReducer,
    },
});

export default store;
