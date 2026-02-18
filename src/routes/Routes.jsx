import React, { useEffect, useState } from 'react';
import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

import { useSelector } from 'react-redux';

const Routes = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isLogin } = useSelector(state => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return showSplash ? <SplashScreen /> : isLogin ? <AppStack /> : <AuthStack />;
  // return showSplash ? <SplashScreen /> : <AppStack />;
};

export default Routes;
