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
        <View style={{ width: 24 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BorderColor,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: PrimaryColor,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: SubHeadingColor,
    fontFamily: 'Helvetica-light',
  },
  infoSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: SubHeadingColor,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BorderColor,
  },
  infoLabel: {
    fontSize: 12,
    color: SubHeadingColor,
    marginBottom: 4,
    fontFamily: 'Helvetica',
  },
  infoValue: {
    fontSize: 16,
    color: HeadingColor,
    fontFamily: 'Helvetica',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
});
