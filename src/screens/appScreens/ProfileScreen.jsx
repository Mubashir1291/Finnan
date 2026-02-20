import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/Reducers/userReducer';
import {
  ArrowBackIcon,
  DeleteIcon,
  LogoutIcon,
  PrivacyIcon,
  RightArrowIcon,
  UnlockIcon,
  UserIcon,
} from '../../assets/Index';
import {
  PrimaryColor,
  SecondaryColor,
  HeadingColor,
  SubHeadingColor,
  BorderColor,
  UserBubbleColor,
  ButtonsColor,
} from '../../utils/Colors';
import { S, VS, MS } from '../../utils/Responsive';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.userData);

  const handleLogout = () => {
    dispatch(logout());
    // No navigation needed - the ProfileOrSignIn wrapper will auto-switch to SignIn
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userData?.data?.display_name) {
      return userData?.data?.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userData?.email) {
      return userData.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={ArrowBackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: S(24) }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>

          <Text style={styles.userName}>
            {userData?.data?.display_name || 'User'}
          </Text>

          <Text style={styles.userEmail}>
            {userData?.data?.user_email || ''}
          </Text>
        </View>
        {/* User Info Section */}
        {/* Edit PRofile  */}
        {/* <View style={styles.infoRow}>
          <View style={styles.leftContainer}>
            <Image source={UserIcon} style={styles.infoIcon} />
            <Text style={styles.sectionTitle}>Edit Profile</Text>
          </View>
          <Image source={RightArrowIcon} style={styles.rightArrow} />
        </View> */}
        {/* Update Password  */}
        <TouchableOpacity
          onPress={() => navigation.navigate('UpdatePasswordScreen')}
        >
          <View style={styles.infoRow}>
            <View style={styles.leftContainer}>
              <Image source={UnlockIcon} style={styles.infoIcon} />
              <Text style={styles.sectionTitle}>Update Password</Text>
            </View>
            <Image source={RightArrowIcon} style={styles.rightArrow} />
          </View>
        </TouchableOpacity>
        {/* Delete Account   */}
        {/* <View style={styles.infoRow}>
          <View style={styles.leftContainer}>
            <Image source={DeleteIcon} style={styles.infoIcon} />
            <Text style={styles.sectionTitle}>Delete Account</Text>
          </View>
          <Image source={RightArrowIcon} style={styles.rightArrow} />
        </View> */}
        {/* Privacy Policy   */}
        {/* <View style={styles.infoRow}>
          <View style={styles.leftContainer}>
            <Image source={PrivacyIcon} style={styles.infoIcon} />
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
          </View>
          <Image source={RightArrowIcon} style={styles.rightArrow} />
        </View> */}
        {/* Logout*/}
        <TouchableOpacity onPress={handleLogout}>
          <View style={styles.infoRow}>
            <View style={styles.leftContainer}>
              <Image source={LogoutIcon} style={styles.infoIcon} />
              <Text style={styles.sectionTitle}>Logout</Text>
            </View>
            <Image source={RightArrowIcon} style={styles.rightArrow} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrimaryColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S(16),
    paddingVertical: VS(12),
    borderBottomWidth: 1,
    borderBottomColor: BorderColor,
  },
  backIcon: {
    width: S(20),
    height: VS(20),
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
  },
  content: {
    flex: 1,
    padding: MS(24),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: VS(32),
    paddingTop: VS(20),
  },
  avatar: {
    width: MS(100),
    height: MS(100),
    borderRadius: MS(50),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: VS(16),
  },
  avatarText: {
    fontSize: MS(36),
    fontFamily: 'Helvetica-Bold',
    color: PrimaryColor,
  },
  userName: {
    fontSize: MS(22),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginBottom: VS(4),
  },
  userEmail: {
    fontSize: MS(14),
    color: SubHeadingColor,
    fontFamily: 'Manrope-Light',
  },

  sectionTitle: {
    fontSize: MS(14),
    fontFamily: 'Helvetica-Bold',
    color: SubHeadingColor,
    letterSpacing: 1,
  },
  infoRow: {
    borderWidth: MS(1),
    borderColor: UserBubbleColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ButtonsColor,
    borderRadius: MS(15),
    width: '100%',
    paddingHorizontal: S(16),
    paddingVertical: VS(8),
    marginBottom: VS(10),
    gap: 5,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIcon: {
    width: S(15),
    height: VS(15),
    tintColor: SubHeadingColor,
    marginRight: S(16),
    resizeMode: 'contain',
  },

  rightArrow: {
    width: S(15),
    height: VS(15),
    tintColor: SubHeadingColor,
    resizeMode: 'contain',
  },
});
