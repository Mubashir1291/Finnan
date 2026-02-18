import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/authScreens/SignInScreen';
import SignUpScreen from '../screens/authScreens/SignUpScreen';
import ForgotPasswordScreen from '../screens/authScreens/ForgotPasswordScreen';
import OTPScreen from '../screens/authScreens/OTPScreen';
import UpdatePasswordScreen from '../screens/authScreens/UpdatePasswordScreen';
import OnboardingScreen from '../screens/authScreens/OnboardingScreen';
import { useSelector } from 'react-redux';
// import VerificationScreen from '../screens/authScreens/VerificationScreen';
// import OTPScreen from '../screens/authScreens/OTPScreen';
// import ForgotPassword from '../screens/authScreens/ForgotPassword';
// import UpdatePassword from '../screens/authScreens/UpdatePassword';
// import ProfileScreenAuth from '../screens/authScreens/ProfileScreen';
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const { isOnboardingCompleted } = useSelector(state => state.user);
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isOnboardingCompleted && <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />}
      <Stack.Screen name="SignInScreen" component={SignInScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />

      {/* <Stack.Screen name="ProfileScreenAuth" component={ProfileScreenAuth} />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="OTPScreen" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="UpdatePassword" component={UpdatePassword} /> */}
    </Stack.Navigator>
  );
};

export default AuthStack;
