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

const SignUpSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      'Password must contain uppercase, lowercase, number, and special character',
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* <Image source={ArrowBackIcon} style={styles.icon} /> */}
        <BackButton />

        <View style={styles.content}>
          <Text style={styles.brand}>FINNAN</Text>
          <Text style={styles.welcome}>Create account</Text>

          <Formik
            initialValues={{
              fullName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={SignUpSchema}
            onSubmit={values => {
              // TODO: real sign up
              console.log('Sign up:', values);
              Toast.show({
                type: 'success',
                text1: 'Signed up',
                text2: `Welcome ${values.fullName}`,
                visibilityTime: 2500,
              });
              setTimeout(() => {
                navigation.navigate('SignInScreen');
              }, 2000);
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
                  placeholder="Full name"
                  placeholderTextColor="#999"
                  style={styles.input}
                  autoComplete="name"
                  textContentType="name"
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  value={values.fullName}
                />
                {errors.fullName &&
                  (touched.fullName || values.fullName.length > 0) && (
                    <Text style={styles.error}>{errors.fullName}</Text>
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
                {errors.email && (touched.email || values.email.length > 0) && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <View>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#999"
                    style={[styles.input, { paddingRight: 50 }]}
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
                    style={[styles.input, { paddingRight: 50 }]}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Sign up</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
        <View style={styles.row}>
          <Text style={{ color: '#999' }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')}>
            <Text style={styles.link}> Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },

  brand: { color: '#fff', fontSize: 26, fontWeight: '900' },
  content: { paddingHorizontal: 15, alignItems: 'center', flex: 1 },
  welcome: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#999', marginBottom: 20 },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#000', fontWeight: '800' },
  row: { flexDirection: 'row', marginBottom: 20, justifyContent: 'center' },
  link: { color: 'white', fontWeight: '700' },
  error: { color: '#ff7675', marginBottom: 8, marginLeft: 10 },
  icon: { width: 24, height: 24, tintColor: '#fff', marginBottom: 20 },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 1,
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: '#999',
  },
});
