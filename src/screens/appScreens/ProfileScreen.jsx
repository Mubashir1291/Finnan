import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/Reducers/userReducer';
import {
  ArrowBackIcon,
  CameraIcon,
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
import { launchImageLibrary } from 'react-native-image-picker';
import { UPDATE_AVATAR, GET_PROFILE_AVATAR } from '../../services/AuthServices';
import Toast from 'react-native-toast-message';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.user.userData);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  useEffect(() => {
    const fetchAvatar = async () => {
      if (userData?.data?.ID) {
        try {
          const response = await GET_PROFILE_AVATAR(userData?.data?.ID);
          // console.log(
          //   'Profile avatar responsesssssssssssssssssssssss:',
          //   response,
          // );

          setProfileImage(response);
        } catch (error) {
          console.error('Failed to fetch profile avatar:', error);
          // Fallback to initials, no toast needed
        } finally {
          setIsLoadingAvatar(false);
        }
      } else {
        setIsLoadingAvatar(false);
      }
    };

    fetchAvatar();
  }, [userData]);

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        // console.log('User cancelled image picker');
      } else if (response.errorCode) {
        // console.log('ImagePicker Error: ', response.errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Image Picker Error',
          text2: response.errorMessage,
        });
      } else if (response.assets && response.assets.length > 0) {
        const imageAsset = response.assets[0];
        setProfileImage(imageAsset.uri);
        if (!userData?.data?.ID) {
          Toast.show({
            type: 'error',
            text1: 'Authentication Error',
            text2: 'Could not find user ID to update avatar.',
          });
          return;
        }

        setIsUploading(true);

        try {
          const payload = { user_id: userData.data.ID };
          const apiResponse = await UPDATE_AVATAR(payload, imageAsset);

          console.log('Avatar update response:', apiResponse);

          // if (apiResponse?.success) {
          //   Toast.show({
          //     type: 'success',
          //     text1: 'Success',
          //     text2: 'Profile image updated!',
          //   });
          //   if (apiResponse.avatar) {
          //     setProfileImage({ uri: apiResponse.avatar });
          //   }
          // } else {
          //   throw new Error(apiResponse?.message || 'Failed to upload image.');
          // }
        } catch (error) {
          console.error('Avatar upload error:', error);
          setProfileImage(null); // Revert on error
          Toast.show({
            type: 'error',
            text1: 'Upload Failed',
            text2: error.message || 'An unexpected error occurred.',
          });
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

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
          <TouchableOpacity
            onPress={handleImagePick}
            style={styles.avatar}
            disabled={isUploading}
          >
            {isLoadingAvatar ? (
              <ActivityIndicator color={PrimaryColor} size="large" />
            ) : profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                }}
                style={styles.avatarImage}
                onError={() => setProfileImage(null)} // Fallback if image URL is invalid
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials()}</Text>
            )}
            {!isUploading && !isLoadingAvatar && (
              <View style={styles.cameraIconContainer}>
                <Image source={CameraIcon} style={styles.cameraIcon} />
              </View>
            )}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={PrimaryColor} size="large" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>
            {userData?.data?.display_name || 'User'}
          </Text>

          <Text style={styles.userEmail}>
            {userData?.data?.user_email || ''}
          </Text>
        </View>
        {/* User Info Section */}
        {/* Edit PRofile  */}
        <TouchableOpacity onPress={() => navigation.navigate('UpdateProfile')}>
          <View style={styles.infoRow}>
            <View style={styles.leftContainer}>
              <Image source={UserIcon} style={styles.infoIcon} />
              <Text style={styles.sectionTitle}>Edit Profile</Text>
            </View>
            <Image source={RightArrowIcon} style={styles.rightArrow} />
          </View>
        </TouchableOpacity>
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
      <Toast />
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
  },
  avatar: {
    width: MS(100),
    height: MS(100),
    borderRadius: MS(50),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: VS(16),
    borderWidth: MS(1),
    borderColor: BorderColor,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: MS(50),
    backgroundColor: BorderColor, // Add a background color for better loading
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: ButtonsColor,
    borderRadius: MS(15),
    borderWidth: MS(2),
    borderColor: BorderColor,
    width: MS(30),
    height: MS(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    width: S(16),
    height: VS(16),
    tintColor: HeadingColor,
    resizeMode: 'contain',
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
  uploadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: MS(50),
  },
});
