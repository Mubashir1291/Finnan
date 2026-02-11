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
                  >
                    <Text style={styles.buttonText}>Sign up</Text>
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
});
