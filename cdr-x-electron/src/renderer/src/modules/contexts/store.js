import { configureStore } from '@reduxjs/toolkit';
import sliceReducer from './slice'; // Import your slice reducer

const store = configureStore({
    reducer: {
        app_slice: sliceReducer,
    },
});

export default store;
