import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExploreScreen from '../../screens/appScreens/ExploreScreen';
import DiscoverScreen from '../../screens/appScreens/DiscoverScreen';

import AgentScreen from '../../screens/appScreens/AgentScreen';
import HomeScreen from '../../screens/appScreens/HomeScreen';
import { DiscoverIcon, ExploreIcon, StarsIcon } from '../../assets/Index';

const Tab = createBottomTabNavigator();

const DummyScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;

const BottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="ExploreScreen"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Image
                source={ExploreIcon}
                style={[
                  styles.iconImage,
                  { tintColor: focused ? '#fff' : '#666' },
                ]}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AgentScreen"
        component={AgentScreen}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('AgentScreen', { agent: 2 });
          },
        })}
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                height: 42,
                width: 42,
                borderRadius: 25,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 25,
              }}
            >
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: 25,
                  backgroundColor: 'black',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={StarsIcon}
                  style={[styles.iconImage, { tintColor: '#fff' }]}
                  resizeMode="contain"
                />
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="DiscoverScreen"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Image
                source={DiscoverIcon}
                style={[
                  styles.iconImage,
                  { tintColor: focused ? '#fff' : '#666' },
                ]}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000',
    borderTopWidth: 0,
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginTop: 25,
  },

  activeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },

  iconImage: {
    width: 24,
    height: 24,
  },
});
