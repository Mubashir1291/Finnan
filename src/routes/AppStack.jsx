import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import ProfileScreen from '../screens/appScreens/ProfileScreen';
import VideoPlayerScreen from '../screens/appScreens/VideoPlayerScreen';
import SourceScreen from '../screens/appScreens/SourceScreen';
import UpdatePasswordScreen from '../screens/authScreens/UpdatePasswordScreen';
import UpdateProfile from '../screens/appScreens/UpdateProfile';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="AppDrawer" component={DrawerNavigator} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="VideoPlayerScreen" component={VideoPlayerScreen} />
      <Stack.Screen name="SourceScreen" component={SourceScreen} />
      <Stack.Screen
        name="UpdatePasswordScreen"
        component={UpdatePasswordScreen}
      />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
    </Stack.Navigator>
  );
};

export default AppStack;
