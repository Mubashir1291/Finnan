import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { S, VS, MS } from '../../utils/Responsive';
import { FORGOT_PASSWORD } from '../../services/AuthServices';

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');

  const handleForgotPassword = async values => {
    setIsLoading(true);
    setEmail(values.email);
    try {
      const obj = {
        email: values.email,
      };
      const response = await FORGOT_PASSWORD(obj);
      console.log(response, 'this response i want for reset password');

      if (response?.code === '101') {
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.msg || 'User not found',
          visibilityTime: 3000,
        });
        return;
      }

      setIsLoading(false);
      setShowModal(true);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.msg || 'Something went wrong',
        text3: ' user not found',
        visibilityTime: 3000,
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
          <View style={styles.header}>
            <Text style={styles.brand}>FINNAN</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.subtitle}>
              Enter your email to receive a verification code
            </Text>

            <Formik
              initialValues={{ email: '' }}
              validationSchema={ForgotSchema}
              onSubmit={handleForgotPassword}
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
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.error}>{errors.email}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text style={styles.buttonText}>Send Code</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ marginTop: VS(12) }}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={{ color: 'white', fontFamily: 'Helvetica' }}>
                      Back to Sign in
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Check your email</Text>
            <Text style={styles.modalMessage}>
              We have sent a password reset code to your email.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
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

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { padding: MS(20), alignItems: 'center' },
  brand: { color: '#fff', fontSize: MS(26), fontFamily: 'Helvetica-Bold' },
  content: { padding: MS(20) },
  title: {
    color: '#fff',
    fontSize: MS(20),
    fontFamily: 'Helvetica-Bold',
    marginBottom: VS(6),
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
    marginTop: VS(6),
  },
  buttonText: { color: '#000', fontFamily: 'Helvetica-Bold' },
  error: { color: '#ff7675', marginBottom: VS(8), fontFamily: 'Helvetica' },
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
