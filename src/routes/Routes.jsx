import React, { useEffect, useState, useRef } from 'react';
import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

import { useSelector, useDispatch } from 'react-redux';
import { setIsLogin, setAiToken } from '../redux/Reducers/userReducer';
import BackgroundTimer from 'react-native-background-timer';
import { AI_LOGIN } from '../services/AppServices';

const Routes = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isLogin } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const handleAILogin = async () => {
    const obj = {
      email: 'waleed@webevis.com',
      password: '12345678',
    };
    try {
      const response = await AI_LOGIN(obj);
      console.log(response, 'AI Login response');
      dispatch(setAiToken(response?.auth?.access_token));
    } catch (error) {
      console.log('AI Login error', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLogin) {
      try {
        // Start the background timer to call handleAILogin every 55 minutes
        intervalRef.current = BackgroundTimer.setInterval(() => {
          handleAILogin();
        }, 3300000); // 55 minutes = 3300000 ms
      } catch (error) {
        console.log('Error setting background timer:', error);
        // Fallback to regular setInterval if BackgroundTimer fails
        intervalRef.current = setInterval(() => {
          handleAILogin();
        }, 3300000);
      }
    } else {
      // Clear the timer when not logged in
      if (intervalRef.current) {
        try {
          BackgroundTimer.clearInterval(intervalRef.current);
        } catch (e) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        try {
          BackgroundTimer.clearInterval(intervalRef.current);
        } catch (e) {
          clearInterval(intervalRef.current);
        }
      }
    };
  }, [isLogin]);

  return showSplash ? <SplashScreen /> : isLogin ? <AppStack /> : <AuthStack />;
  // return showSplash ? <SplashScreen /> : <AppStack />;
};

export default Routes;
