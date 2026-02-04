import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomTabs from '../components/tabs/BottomTabs';
import PlayersScreen from '../screens/appScreens/PlayersScreen';
import AuthStack from './AuthStack';
import {
  ExploreIcon,
  DiscoverIcon,
  StarsIcon,
  UserIcon,
} from '../assets/Index';

const Drawer = createDrawerNavigator();

const DrawerContent = ({ navigation }) => {
  const Item = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Image source={icon} style={styles.itemIcon} />
      <Text style={styles.itemLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FINAN</Text>
      </View>

      <View style={styles.itemsWrap}>
        <Item
          icon={StarsIcon}
          label="Agent"
          onPress={() => navigation.navigate('Home', { screen: 'AgentScreen' })}
        />

        <Item
          icon={ExploreIcon}
          label="Explore"
          onPress={() =>
            navigation.navigate('Home', { screen: 'ExploreScreen' })
          }
        />

        <Item
          icon={DiscoverIcon}
          label="Discover"
          onPress={() =>
            navigation.navigate('Home', { screen: 'DiscoverScreen' })
          }
        />

        <Item
          icon={UserIcon}
          label="Players"
          onPress={() => navigation.navigate('Players')}
        />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() =>
            navigation.navigate('Auth', { screen: 'SignInScreen' })
          }
        >
          <Text style={styles.loginText}>Login / Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      id="AppDrawer"
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#000',
          width: 260,
        },
      }}
      drawerContent={props => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={BottomTabs} />
      <Drawer.Screen name="Players" component={PlayersScreen} />
      <Drawer.Screen name="Auth" component={AuthStack} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  title: { color: '#fff', fontSize: 26, fontWeight: '900' },
  itemsWrap: { paddingHorizontal: 8, paddingTop: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  itemIcon: {
    width: 26,
    height: 26,
    tintColor: '#fff',
    resizeMode: 'contain',
    marginRight: 14,
  },
  itemLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottom: { padding: 16, marginTop: 'auto' },
  loginBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginText: { color: '#000', fontWeight: '700' },
});
