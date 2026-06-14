import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  theme: "light",
  sidebarOpen: true,
};
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});
export const { toggleTheme, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
