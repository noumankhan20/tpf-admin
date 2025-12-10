import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../slices/apiSlice";
import adminAuthReducer from "../slices/adminAuthSlice";
const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    adminAuth: adminAuthReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export default store;
