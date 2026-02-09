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
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { HideIcon, UserIcon, ViewIcon, hide, view } from '../../assets/Index';
import BackButton from '../../components/BackButton';
import { LOGIN_ACCOUNT } from '../../services/AuthServices';
import { useDispatch } from 'react-redux';
import {
  setAccessToken,
  setIsLogin,
  setUserData,
} from '../../redux/Reducers/userReducer';
import { store } from '../../redux/store';

const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Atleast 8 Character')
    .required('Password is required'),
});

const SignInScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async values => {
    setIsLoading(true);
    try {
      const payload = { email: values.email, password: values.password };
      const response = await LOGIN_ACCOUNT(payload);
      console.log('Login response', response);
      store.dispatch(setAccessToken(response?.auth?.access_token));
      store.dispatch(
        setUserData({
          email: values.email,

          name:
            response?.user?.name ||
            response?.data?.name ||
            values.email.split('@')[0],
        }),
      );
      store.dispatch(setIsLogin(true));
      setIsLoading(false);
      // No navigation needed - the ProfileOrSignIn wrapper will auto-switch to Profile
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: error.message || 'Something went wrong',
        visibilityTime: 2500,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* <BackButton /> */}

        <View style={styles.content}>
          <Text style={styles.brand}>FINNAN</Text>
          <Text style={styles.welcome}>Welcome back</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={SignInSchema}
            onSubmit={values => handleLogin(values)}
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
                    autoComplete="password"
                    textContentType="password"
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

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgot}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
        <View style={styles.row}>
          <Text style={{ color: '#999' }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.link}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { padding: 20, alignItems: 'center' },
  brand: { color: '#fff', fontSize: 26, fontWeight: '900' },
  content: { padding: 20, alignItems: 'center', flex: 1 },
  icon: { width: 80, height: 80, tintColor: '#fff', marginVertical: 12 },
  welcome: { color: '#fff', fontSize: 16, marginTop: 20, marginBottom: 20 },
  subtitle: { color: '#999', marginBottom: 20 },
  input: {
    backgroundColor: '#1d1c1cff',
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
  forgot: { color: 'white', textAlign: 'right', marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  link: { color: 'white', fontWeight: '700' },
  error: { color: '#ff7675', marginBottom: 8 },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
    zIndex: 1,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#999',
  },
});
