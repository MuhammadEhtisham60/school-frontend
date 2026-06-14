import { createSlice } from "@reduxjs/toolkit";
const brandingSlice = createSlice({
  name: "branding",
  initialState: {
    name: "EduPulse",
    logo: "/logo.png",
  },
  reducers: {
    updateBranding: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});
export const { updateBranding } = brandingSlice.actions;
export default brandingSlice.reducer;
