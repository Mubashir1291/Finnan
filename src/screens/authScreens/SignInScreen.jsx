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
  Modal,
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
  setAiToken,
  setIsLogin,
  setUserData,
} from '../../redux/Reducers/userReducer';
import { store } from '../../redux/store';
import { S, VS, MS } from '../../utils/Responsive';
import { AI_LOGIN } from '../../services/AppServices';

const SignInSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    // .min(8, 'Atleast 8 Character')
    .required('Password is required'),
});

const SignInScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  const handleLogin = async values => {
    setIsLoading(true);
    try {
      const payload = { email: values.email, password: values.password };
      const response = await LOGIN_ACCOUNT(payload);
      console.log('Login response', response);

      if (
        response === 'not authenticated' ||
        response === 'not_authenticated'
      ) {
        setIsLoading(false);
        setShowActivationModal(true);
      } else {
        store.dispatch(setUserData(response));
        store.dispatch(setIsLogin(true));
        setIsLoading(false);
      }

      // store.dispatch(setAccessToken(response?.auth?.access_token));

      // No navigation needed - the ProfileOrSignIn wrapper will auto-switch to Profile
    } catch (error) {
      setIsLoading(false);
      if (
        error?.message?.includes('not authenticated') ||
        error?.code === 'not_authenticated'
      ) {
        setShowActivationModal(true);
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: error.message || 'Something went wrong',
        visibilityTime: 2500,
      });
    }
  };

  const HandleAILogin = async values => {
    const obj = {
      email: 'waleed@webevis.com',
      password: '12345678',
    };
    try {
      const response = await AI_LOGIN(obj);
      console.log(response, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      store.dispatch(setAiToken(response?.auth?.access_token));
    } catch (error) {}
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
              onSubmit={values => {
                handleLogin(values);
                HandleAILogin(values);
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

      <Modal
        visible={showActivationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActivationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Activation Required</Text>
            <Text style={styles.modalMessage}>
              Check your email inbox or spam for account activation.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowActivationModal(false)}
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
