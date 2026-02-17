import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLogin: false,
  accessToken: null,
  userData: null,
  aiToken: null,
  isOnboardingCompleted: false,
};

export const userReducer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsLogin: (state, action) => {
      state.isLogin = action.payload;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setAiToken: (state, action) => {
      state.aiToken = action.payload;
    },
    setIsOnboardingCompleted: (state, action) => {
      state.isOnboardingCompleted = action.payload;
    },
    logout: state => {
      state.isLogin = false;
      state.accessToken = null;
      state.aiToken = null;
    },
  },
});

export const {
  setIsLogin,
  setAccessToken,
  logout,
  setUserData,
  setAiToken,
  setIsOnboardingCompleted,
} = userReducer.actions;

export default userReducer.reducer;
