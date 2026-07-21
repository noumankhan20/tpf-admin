import { createSlice } from "@reduxjs/toolkit";

const storedAdmin =
  typeof window !== "undefined"
    ? localStorage.getItem("adminInfo")
    : null;

const initialState = {
  adminInfo: storedAdmin ? JSON.parse(storedAdmin) : null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      state.adminInfo = action.payload;

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "adminInfo",
          JSON.stringify(action.payload)
        );
      }
    },

    logoutAdmin: (state) => {
      state.adminInfo = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("adminInfo");
        localStorage.removeItem("adminToken");
      }
    },
  },
});

export const { setAdminCredentials, logoutAdmin } =
  adminAuthSlice.actions;

export default adminAuthSlice.reducer;
