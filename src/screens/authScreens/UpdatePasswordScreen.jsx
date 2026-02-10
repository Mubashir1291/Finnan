import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { HideIcon, ViewIcon } from '../../assets/Index';

const PasswordSchema = Yup.object().shape({
  password: Yup.string().min(6, 'Too short').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

const UpdatePasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>FINNAN</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create a new password</Text>
        <Text style={styles.subtitle}>for {email || 'your account'}</Text>

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={PasswordSchema}
          onSubmit={values => {
            // TODO: call API to update password
            Toast.show({
              type: 'success',
              text1: 'Password updated',
              text2: 'You can now sign in with your new password',
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
              <View>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  style={[styles.input, { paddingRight: 50 }]}
                  secureTextEntry={!showPassword}
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
              {errors.password && touched.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              <View>
                <TextInput
                  placeholder="Re-enter password"
                  placeholderTextColor="#999"
                  style={[styles.input, { paddingRight: 50 }]}
                  secureTextEntry={!showConfirmPassword}
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
              {errors.confirmPassword && touched.confirmPassword && (
                <Text style={styles.error}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Update password</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default UpdatePasswordScreen;

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
    backgroundColor: '#111',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#000', fontFamily: 'Helvetica-Bold' },
  error: { color: '#ff7675', marginBottom: 8, fontFamily: 'Helvetica' },
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
