import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  profile: null,
  isLoading: false,
  error: null,
};
const companyProfileSlice = createSlice({
  name: "companyProfile",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});
export const { setProfile, setLoading } = companyProfileSlice.actions;
export default companyProfileSlice.reducer;
