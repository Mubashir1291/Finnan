import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  ArrowBackIcon,
  HideIcon,
  UserIcon,
  ViewIcon,
  hide,
  view,
} from '../../assets/Index';
import BackButton from '../../components/BackButton';
import { S, VS, MS } from '../../utils/Responsive';
import { REGISTER_ACCOUNT } from '../../services/AuthServices';

const SignUpSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      'Password must contain:\n•Uppercase\n•Lowercase\n•Number\n•Special Character',
    )
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const SignUpScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* <Image source={ArrowBackIcon} style={styles.icon} /> */}
          <BackButton />

          <View style={styles.content}>
            <Text style={styles.brand}>FINNAN</Text>
            <Text style={styles.welcome}>Create account</Text>

            <Formik
              initialValues={{
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={SignUpSchema}
              onSubmit={async values => {
                setIsLoading(true);
                try {
                  const formData = new FormData();
                  formData.append('first_name', values.first_name);
                  formData.append('last_name', values.last_name);
                  formData.append('email', values.email);
                  formData.append('password', values.password);
                  formData.append('confirm_password', values.confirmPassword);
                  formData.append('is_submit', 1);
                  const response = await REGISTER_ACCOUNT(formData);
                  console.log(response, 'this is response for signup');

                  if (
                    response?.message
                      ?.toLowerCase()
                      ?.includes('already exist') ||
                    response?.data?.message
                      ?.toLowerCase()
                      ?.includes('already exist') ||
                    (typeof response === 'string' &&
                      response?.toLowerCase()?.includes('already exist'))
                  ) {
                    Toast.show({
                      type: 'error',
                      text1: 'Registration Failed',
                      text2: 'User already exists',
                      visibilityTime: 2500,
                    });
                  } else {
                    setShowSuccessModal(true);
                  }
                } catch (error) {
                  console.log(error);
                  Toast.show({
                    type: 'error',
                    text1: 'Registration Failed',
                    text2: error?.message || 'Something went wrong',
                    visibilityTime: 2500,
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={{ width: '100%' }}>
                  <TextInput
                    placeholder="First Name"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onChangeText={handleChange('first_name')}
                    onBlur={handleBlur('first_name')}
                    value={values.first_name}
                  />
                  {errors.first_name &&
                    (touched.first_name || values.first_name.length > 0) && (
                      <Text style={styles.error}>{errors.first_name}</Text>
                    )}

                  <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="#999"
                    style={styles.input}
                    onChangeText={handleChange('last_name')}
                    onBlur={handleBlur('last_name')}
                    value={values.last_name}
                  />
                  {errors.last_name &&
                    (touched.last_name || values.last_name.length > 0) && (
                      <Text style={styles.error}>{errors.last_name}</Text>
                    )}

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#999"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                  {errors.email &&
                    (touched.email || values.email.length > 0) && (
                      <Text style={styles.error}>{errors.email}</Text>
                    )}

                  <View>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#999"
                      style={[styles.input, { paddingRight: S(50) }]}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                      textContentType="newPassword"
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Image
                        source={showPassword ? ViewIcon : HideIcon}
                        style={styles.iconImage}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password &&
                    (touched.password || values.password.length > 0) && (
                      <Text style={styles.error}>{errors.password}</Text>
                    )}

                  <View>
                    <TextInput
                      placeholder="Re-enter password"
                      placeholderTextColor="#999"
                      style={[styles.input, { paddingRight: S(50) }]}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="password-new"
                      textContentType="newPassword"
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      <Image
                        source={showConfirmPassword ? ViewIcon : HideIcon}
                        style={styles.iconImage}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword &&
                    (touched.confirmPassword ||
                      values.confirmPassword.length > 0) && (
                      <Text style={styles.error}>{errors.confirmPassword}</Text>
                    )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.buttonText}>Sign up</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
          <View style={styles.row}>
            <Text style={{ color: '#999', fontFamily: 'Helvetica' }}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignInScreen')}
            >
              <Text style={styles.link}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Account Created Successfully</Text>
            <Text style={styles.modalMessage}>
              Check your email inbox or spam for account verification.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('SignInScreen');
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },

  brand: { color: '#fff', fontSize: MS(26), fontFamily: 'Helvetica-Bold' },
  content: { paddingHorizontal: S(15), alignItems: 'center', flex: 1 },
  welcome: { color: '#fff', fontSize: MS(22), fontFamily: 'Helvetica-Bold' },
  subtitle: { color: '#999', marginBottom: VS(20), fontFamily: 'Helvetica' },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    paddingHorizontal: S(14),
    paddingVertical: VS(12),
    borderRadius: MS(10),
    marginBottom: VS(10),
    fontFamily: 'Helvetica',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: VS(14),
    borderRadius: MS(10),
    alignItems: 'center',
    marginTop: VS(12),
  },
  buttonText: { color: '#000', fontFamily: 'Helvetica-Bold' },
  row: { flexDirection: 'row', marginBottom: VS(20), justifyContent: 'center' },
  link: { color: 'white', fontFamily: 'Helvetica-Bold' },
  error: {
    color: '#ff7675',
    marginBottom: VS(8),
    marginLeft: S(10),
    fontFamily: 'Helvetica',
  },
  icon: {
    width: S(24),
    height: VS(24),
    tintColor: '#fff',
    marginBottom: VS(20),
  },
  eyeIcon: {
    position: 'absolute',
    right: S(14),
    top: VS(12),
    zIndex: 1,
  },
  iconImage: {
    width: S(20),
    height: VS(20),
    tintColor: '#999',
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: MS(20),
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#1d1c1cff',
    borderRadius: MS(14),
    padding: MS(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    marginBottom: VS(12),
    textAlign: 'center',
  },
  modalMessage: {
    color: '#ccc',
    fontSize: MS(14),
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: VS(20),
    lineHeight: VS(20),
  },
  modalButton: {
    backgroundColor: '#fff',
    paddingVertical: VS(10),
    paddingHorizontal: S(30),
    borderRadius: MS(8),
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#000',
    fontFamily: 'Helvetica-Bold',
    fontSize: MS(14),
  },
});
