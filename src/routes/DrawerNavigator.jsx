import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import BottomTabs from '../components/tabs/BottomTabs';
import PlayersScreen from '../screens/appScreens/PlayersScreen';
import AuthStack from './AuthStack';
import {
  ExploreIcon,
  DiscoverIcon,
  StarsIcon,
  UserIcon,
  HomeIcon,
} from '../assets/Index';
import { MS, S, VS } from '../utils/Responsive';

const Drawer = createDrawerNavigator();

const DrawerContent = ({ navigation }) => {
  const { isLogin } = useSelector(state => state.user);

  const Item = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Image source={icon} style={styles.itemIcon} />
      <Text style={styles.itemLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FINNAN</Text>
      </View>

      <View style={styles.itemsWrap}>
        <Item
          icon={HomeIcon}
          label="Home"
          onPress={() => navigation.navigate('Home', { screen: 'HomeScreen' })}
        />
        <Item
          icon={StarsIcon}
          label="Ask Finnan"
          onPress={() =>
            navigation.navigate('Home', {
              screen: 'AgentScreen',
              params: { agent: 1 },
            })
          }
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
      </View>

      {!isLogin && (
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    padding: MS(20),
    borderBottomWidth: MS(1),
    borderBottomColor: '#222',
  },
  title: { color: '#fff', fontSize: MS(26), fontFamily: 'Helvetica-Bold' },
  itemsWrap: { paddingHorizontal: S(8), paddingTop: VS(10) },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: VS(8),
    paddingHorizontal: S(10),
  },
  itemIcon: {
    width: S(20),
    height: VS(20),
    tintColor: '#fff',
    resizeMode: 'contain',
    marginRight: S(14),
  },
  itemLabel: { color: '#fff', fontSize: 16, fontFamily: 'Manrope-Medium' },
  bottom: { padding: MS(16), marginTop: 'auto' },
  loginBtn: {
    backgroundColor: '#fff',
    paddingVertical: VS(12),
    borderRadius: MS(10),
    alignItems: 'center',
  },
  loginText: { color: '#000', fontFamily: 'Helvetica-Bold' },
});
