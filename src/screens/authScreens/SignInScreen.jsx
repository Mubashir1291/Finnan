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
  ScrollView,
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
import { S, VS, MS } from '../../utils/Responsive';

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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
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
            <Text style={{ color: '#999', fontFamily: 'Helvetica' }}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUpScreen')}
            >
              <Text style={styles.link}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { padding: MS(20), alignItems: 'center' },
  brand: { color: '#fff', fontSize: MS(26), fontFamily: 'Helvetica-Bold' },
  content: { padding: MS(20), alignItems: 'center', flex: 1 },
  icon: {
    width: S(80),
    height: VS(80),
    tintColor: '#fff',
    marginVertical: VS(12),
  },
  welcome: {
    color: '#fff',
    fontSize: MS(16),
    marginTop: VS(20),
    marginBottom: VS(20),
    fontFamily: 'Helvetica',
  },
  subtitle: { color: '#999', marginBottom: VS(20), fontFamily: 'Helvetica' },
  input: {
    backgroundColor: '#1d1c1cff',
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
  forgot: {
    color: 'white',
    textAlign: 'right',
    marginTop: VS(6),
    fontFamily: 'Helvetica',
  },
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: VS(20) },
  link: { color: 'white', fontFamily: 'Helvetica-Bold' },
  error: { color: '#ff7675', marginBottom: VS(8), fontFamily: 'Helvetica' },
  eyeIcon: {
    position: 'absolute',
    right: S(14),
    top: VS(12),
    resizeMode: 'contain',
    zIndex: 1,
  },
  iconImage: {
    width: S(20),
    height: VS(20),
    tintColor: '#999',
    resizeMode: 'contain',
  },
});
