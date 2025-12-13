import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminInfo: null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      state.adminInfo = action.payload;

      if (typeof window !== "undefined") {
        localStorage.setItem("adminInfo", JSON.stringify(action.payload));
      }
    },

    hydrateAdminFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("adminInfo");
        state.adminInfo = stored ? JSON.parse(stored) : null;
      }
    },

    logoutAdmin: (state) => {
      state.adminInfo = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("adminInfo");
      }
    },
  },
});

export const {
  setAdminCredentials,
  hydrateAdminFromStorage,
  logoutAdmin,
} = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
