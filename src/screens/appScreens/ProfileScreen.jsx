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
import { ArrowBackIcon } from '../../assets/Index';
import {
  PrimaryColor,
  SecondaryColor,
  HeadingColor,
  SubHeadingColor,
  BorderColor,
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
    if (userData?.name) {
      return userData.name
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
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || ''}</Text>
        </View>

        {/* User Info Section */}
        {/* <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          {userData?.name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{userData.name}</Text>
            </View>
          )}

          {userData?.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
          )}
        </View> */}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
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
    fontFamily: 'Helvetica-light',
  },
  infoSection: {
    marginBottom: VS(40),
  },
  sectionTitle: {
    fontSize: MS(14),
    fontFamily: 'Helvetica-Bold',
    color: SubHeadingColor,
    marginBottom: VS(16),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    paddingVertical: VS(16),
    borderBottomWidth: 1,
    borderBottomColor: BorderColor,
  },
  infoLabel: {
    fontSize: MS(12),
    color: SubHeadingColor,
    marginBottom: VS(4),
    fontFamily: 'Helvetica',
  },
  infoValue: {
    fontSize: MS(16),
    color: HeadingColor,
    fontFamily: 'Helvetica',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: VS(14),
    borderRadius: MS(10),
    alignItems: 'center',
    marginBottom: VS(40),
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: MS(16),
    fontFamily: 'Helvetica-Bold',
  },
});
