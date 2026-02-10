import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ForgotSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
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
          onSubmit={values => {
            // TODO: call API to send OTP
            Toast.show({
              type: 'success',
              text1: 'OTP Sent',
              text2: `A verification code was sent to ${values.email}`,
              visibilityTime: 2500,
            });
            setTimeout(() => {
              navigation.navigate('OTPScreen', { email: values.email });
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

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Send Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 12 }}
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
      <Toast />
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { padding: 20, alignItems: 'center' },
  brand: { color: '#fff', fontSize: 26, fontFamily: 'Helvetica-Bold' },
  content: { padding: 20 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  subtitle: { color: '#999', marginBottom: 20, fontFamily: 'Helvetica' },
  input: {
    backgroundColor: '#1d1c1cff',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#000', fontFamily: 'Helvetica-Bold' },
  error: { color: '#ff7675', marginBottom: 8, fontFamily: 'Helvetica' },
});
