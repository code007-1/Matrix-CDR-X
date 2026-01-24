import { createSlice } from '@reduxjs/toolkit';

const app_slice = createSlice({
    name: 'app_slice',
    initialState: {
        logged_in: false,
        access_key: null,

        internal_cdr: [],
        incoming_cdr: [],
        outgoing_cdr: [],

        internal_loading: false,
        incoming_loading: false,
        outgoing_loading: false
    },

    reducers: {
        setAccessKey: (state, action) => {
            state.access_key = action.payload;
        },
        set_internal_cdr: (state, action) => {
            state.internal_cdr = action.payload;
        },
        set_incoming_cdr: (state, action) => {
            state.incoming_cdr = action.payload;
        },
        set_outgoing_cdr: (state, action) => {
            state.outgoing_cdr = action.payload;
        },
        set_incoming_loading: (state, action) => {
            state.incoming_loading = action.payload;
        },
        set_internal_loading: (state, action) => {
            state.internal_loading = action.payload;
        },
        set_outgoing_loading: (state, action) => {
            state.outgoing_loading = action.payload;
        },
        set_login_status: (state, action) => {
            state.logged_in = action.payload;
        },
        set_access_key: (state, action) => {
            state.access_key = action.payload;
        }
    }
});

export const { set_access_key, set_internal_cdr, set_outgoing_cdr, set_incoming_cdr, set_outgoing_loading, set_incoming_loading, set_internal_loading: set_internal_loading, set_login_status } = app_slice.actions;
export default app_slice.reducer;
