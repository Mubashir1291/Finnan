import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnBoadScreen from '../screens/authScreens/OnBoadScreen';
import LoginScreen from '../screens/authScreens/LoginScreen';
import SignupScreen from '../screens/authScreens/SignupScreen';

// import VerificationScreen from '../screens/authScreens/VerificationScreen';
// import OTPScreen from '../screens/authScreens/OTPScreen';
// import ForgotPassword from '../screens/authScreens/ForgotPassword';
// import UpdatePassword from '../screens/authScreens/UpdatePassword';
// import ProfileScreenAuth from '../screens/authScreens/ProfileScreen';
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="OnBoadScreen" component={OnBoadScreen} />

      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      {/* <Stack.Screen name="ProfileScreenAuth" component={ProfileScreenAuth} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="UpdatePassword" component={UpdatePassword} /> */}
    </Stack.Navigator>
  );
};

export default AuthStack;
