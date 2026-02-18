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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { MenuIcon, UserIcon, Logo, LogoIcon } from '../../assets/Index';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const { isLogin } = useSelector(state => state.user);

  const suggestedPrompts = [
    'What data does Finnan need to work well?',
    'Does Finnan replace human advisors?',
    'How is Finnan different for football players?',
  ];

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
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image source={MenuIcon} style={styles.headerIcon} />
          </TouchableOpacity>
          <View style={styles.FinnanLogo}>
            <Image source={LogoIcon} style={styles.logoIcon} />
            <Text style={styles.headerTitle}>FINNAN</Text>
          </View>
        </View>

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            Play hard. Plan smart.Your New Financial Assistant
          </Text>

          <Text style={styles.subtitle}>
            The AI financial assistant for football professionals.
            Institutional-grade financial planning, tax intelligence, and Asset
            management. Plan like a pro. Retire like a legend.
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

          <View style={styles.promptsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestedPrompts.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptItem}
                  onPress={() =>
                    navigation.navigate('AgentScreen', { prompt: item })
                  }
                >
                  <Text style={styles.promptText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  FinnanLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S(2),
    justifyContent: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S(10),
  },
  logoIcon: {
    width: S(12),
    height: VS(12),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: MS(20),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: S(20),
    marginTop: -VS(40), // Slight offset to center visually with header
  },
  title: {
    fontSize: MS(30),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginBottom: VS(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: MS(14),
    fontFamily: 'Helvetica',
    color: SubHeadingColor,
    textAlign: 'center',
    lineHeight: VS(22),
    marginBottom: VS(10),
    maxWidth: '100%',
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
  promptsContainer: {
    width: '100%',
    marginTop: VS(24),
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'black',
    paddingVertical: VS(5),
    paddingHorizontal: S(16),
    borderRadius: MS(20),
    marginRight: S(10),
    borderWidth: MS(1),
    borderColor: '#fff',
  },
  promptText: {
    color: '#fff',
    fontSize: MS(13),
    fontFamily: 'Helvetica',
  },
  // promptArrow: {
  //   color: SubHeadingColor,
  //   fontSize: MS(16),
  // },
});
