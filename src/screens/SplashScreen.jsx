import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { setIsLogin } from '../redux/Reducers/userReducer';
import { store } from '../redux/store';

const SplashScreen = () => {
  useEffect(() => {
    store.dispatch(setIsLogin(false));
  }, []);
  return (
    <View style={styles.Container}>
      <Text style={{ fontSize: 20, color: 'white' }}>FINNAN</Text>
    </View>
  );
};
export default SplashScreen;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'Black',
  },
});
