import React, { useState } from 'react';
import { UPDATE_PROFILE } from '../../services/AuthServices';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  PrimaryColor,
  HeadingColor,
  SubHeadingColor,
  BorderColor,
  SecondaryColor,
  ButtonsColor,
} from '../../utils/Colors';
import { MS, S, VS } from '../../utils/Responsive';
import {
  AddressIcon,
  ArrowBackIcon,
  PhoneIcon,
  UserIcon,
} from '../../assets/Index';

const UpdateProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  address: Yup.string().required('Address is required'),
  phone: Yup.string()
    .required('Phone Number is required')
    .min(10, 'Phone number must be at least 10 digits'),
});

const UpdateProfile = () => {
  const navigation = useNavigation();
  const { userData } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async values => {
    setLoading(true);
    try {
      const response = await UPDATE_PROFILE({
        user_id: userData?.data?.ID,
        first_name: values.firstName,
        address: values.address,
        phone: values.phone,
      });
      console.log(response, 'Update Profileeeeee');
      navigation.goBack();
    } catch (e) {
      // Optionally show error message
      console.log('Update profile error', e);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={ArrowBackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDIT PROFILE</Text>
        <View style={{ width: S(20) }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{
              firstName: userData?.data?.display_name || '',
              address: '',
              phone: '',
            }}
            validationSchema={UpdateProfileSchema}
            onSubmit={handleUpdate}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={styles.inputContainer}>
                  <Image source={UserIcon} style={styles.userIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={SubHeadingColor}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                  />
                </View>
                {errors.firstName && touched.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Image source={PhoneIcon} style={styles.userIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Address"
                    placeholderTextColor={SubHeadingColor}
                    value={values.address}
                    onChangeText={handleChange('address')}
                    onBlur={handleBlur('address')}
                    multiline
                  />
                </View>
                {errors.address && touched.address && (
                  <Text style={styles.errorText}>{errors.address}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Image source={AddressIcon} style={styles.userIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor={SubHeadingColor}
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.phone && touched.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={PrimaryColor} />
                  ) : (
                    <Text style={styles.buttonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdateProfile;

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
    padding: MS(24),
  },
  inputContainer: {
    backgroundColor: ButtonsColor,
    borderRadius: MS(12),
    paddingHorizontal: S(10),
    color: HeadingColor,
    fontFamily: 'Manrope-Regular',
    fontSize: MS(14),
    borderWidth: 1,
    borderColor: BorderColor,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: S(10),
    marginBottom: VS(16),
  },
  label: {
    fontSize: MS(14),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginBottom: VS(8),
    marginLeft: S(4),
  },
  input: { color: SubHeadingColor, width: '90%' },
  button: {
    backgroundColor: '#fff',
    borderRadius: MS(30),
    paddingVertical: VS(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: VS(20),
  },
  buttonText: {
    color: PrimaryColor,
    fontSize: MS(16),
    fontFamily: 'Helvetica-Bold',
  },
  userIcon: {
    width: S(20),
    height: VS(20),
    tintColor: SubHeadingColor,
    resizeMode: 'contain',
  },
  errorText: {
    color: '#ff7675',
    fontSize: MS(12),
    fontFamily: 'Manrope-Regular',
    marginLeft: S(4),
    marginBottom: VS(10),
    marginTop: VS(-10),
  },
});
