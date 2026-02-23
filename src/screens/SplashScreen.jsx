import { StyleSheet, Text, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { setIsLogin } from '../redux/Reducers/userReducer';
import { store } from '../redux/store';
import { MS, S, VS } from '../utils/Responsive';

const SplashScreen = () => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // store.dispatch(setIsLogin(false));
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 10,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <View style={styles.Container}>
      <Animated.Text
        style={{
          fontSize: 30,
          fontFamily: 'Helvetica-Bold',
          color: 'white',
          transform: [{ scale: scaleAnim }],
        }}
      >
        FINNAN
      </Animated.Text>
      <Animated.Text
        style={{
          color: 'white',
          textAlign: 'center',
          marginTop: VS(5),
          fontSize: MS(16),
          fontFamily: 'Manrope-Medium',
          opacity: fadeAnim,
          paddingHorizontal: S(20),
        }}
      >
        Finnan — Your AI Agent for Football Wealth, Tax & Investment Mastery
      </Animated.Text>
    </View>
  );
};
export default SplashScreen;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
