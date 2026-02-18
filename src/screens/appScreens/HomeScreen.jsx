import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { store } from '../../redux/store';
import { setIsLogin } from '../../redux/Reducers/userReducer';
import {
  PrimaryColor,
  HeadingColor,
  SubHeadingColor,
  BorderColor,
  SecondaryColor,
  ButtonsColor,
} from '../../utils/Colors';
import { MS, S, VS } from '../../utils/Responsive';
import { MenuIcon, UserIcon } from '../../assets/Index';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const { isLogin } = useSelector(state => state.user);

  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate('AgentScreen', { prompt: searchText });
      setSearchText('');
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PrimaryColor} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={MenuIcon} style={styles.headerIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            isLogin
              ? navigation.navigate('Profile')
              : store.dispatch(setIsLogin(false))
          }
        >
          <Image source={UserIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>FINNAN</Text>
        <Text style={styles.subtitle}>
          The Global Football Master Agent. Powered by AI.{'\n'}
          Informed by Data.
        </Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Finnan anything..."
            placeholderTextColor={SubHeadingColor}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSearch}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrimaryColor,
  },
  header: {
    height: VS(56),
    paddingHorizontal: S(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: S(30),
    height: VS(30),
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: S(20),
    marginTop: -VS(40), // Slight offset to center visually with header
  },
  title: {
    fontSize: MS(48),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    letterSpacing: 2,
    marginBottom: VS(10),
  },
  subtitle: {
    fontSize: MS(14),
    fontFamily: 'Helvetica',
    color: SubHeadingColor,
    textAlign: 'center',
    lineHeight: VS(22),
    marginBottom: VS(10),
    maxWidth: '85%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: MS(30),
    padding: MS(6),
    width: '100%',
    borderWidth: MS(1),
    borderColor: BorderColor,
  },
  input: {
    flex: 1,
    color: ButtonsColor,
    fontFamily: 'Helvetica',
    fontSize: MS(14),
    paddingHorizontal: S(16),
    paddingVertical: VS(10),
  },
  sendButton: {
    width: S(44),
    height: S(44),
    backgroundColor: ButtonsColor,
    borderRadius: S(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: MS(18),
    color: '#fff',
    fontFamily: 'Helvetica-Bold',
    marginLeft: 2,
  },
});
