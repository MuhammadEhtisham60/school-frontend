import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "../services";
import brandingReducer from "./brandingStore";
import authReducer from "./slices/authSlice";
import companyProfileReducer from "./slices/companyProfileSlice";
import uiReducer from "./slices/uiSlice";
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    branding: brandingReducer,
    auth: authReducer,
    companyProfile: companyProfileReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});
setupListeners(store.dispatch);
