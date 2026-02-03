import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const SplashScreen = () => {
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
