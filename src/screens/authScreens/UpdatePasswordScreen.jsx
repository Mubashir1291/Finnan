import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { ArrowBackIcon, HideIcon, ViewIcon } from '../../assets/Index';
import { S, VS, MS } from '../../utils/Responsive';
import { UPDATE_PASSWORD } from '../../services/AuthServices';
import { store } from '../../redux/store';
import { setIsLogin } from '../../redux/Reducers/userReducer';
import { BorderColor } from '../../utils/Colors';

const PasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required('Old Password is required'),
  password: Yup.string().min(6, 'Too short').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

const UpdatePasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const userData = useSelector(state => state.user.userData);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={ArrowBackIcon} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.brand}>FINNAN</Text>
            <View style={{ width: S(20) }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Create a new password</Text>
            {/* <Text style={styles.subtitle}>for {email || 'your account'}</Text> */}

            <Formik
              initialValues={{
                oldPassword: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={PasswordSchema}
              onSubmit={async values => {
                setIsLoading(true);
                try {
                  const payload = {
                    user_id: userData?.data?.ID,
                    old_password: values.oldPassword,
                    new_password: values.password,
                  };
                  const response = await UPDATE_PASSWORD(payload);
                  console.log(response, 'response update password');
                  setIsLoading(false);
                  if (response === 'Success') {
                    Toast.show({
                      type: 'success',
                      text1: 'Password updated',
                      text2: 'You can now sign in with your new password',
                      visibilityTime: 2500,
                    });
                    setTimeout(() => {
                      store.dispatch(setIsLogin(false));
                    }, 2000);
                  } else {
                    Toast.show({
                      type: 'error',
                      text1: 'Update Failed',
                      text2: response?.message || 'Something went wrong',
                      visibilityTime: 2500,
                    });
                  }
                } catch (error) {
                  setIsLoading(false);
                  Toast.show({
                    type: 'error',
                    text1: 'Update Failed',
                    text2: error?.message || 'Something went wrong',
                    visibilityTime: 2500,
                  });
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
                  <View>
                    <TextInput
                      placeholder="Old Password"
                      placeholderTextColor="#999"
                      style={[styles.input, { paddingRight: S(50) }]}
                      secureTextEntry={!showOldPassword}
                      onChangeText={handleChange('oldPassword')}
                      onBlur={handleBlur('oldPassword')}
                      value={values.oldPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowOldPassword(!showOldPassword)}
                      style={styles.eyeIcon}
                    >
                      <Image
                        source={showOldPassword ? ViewIcon : HideIcon}
                        style={styles.iconImage}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.oldPassword && touched.oldPassword && (
                    <Text style={styles.error}>{errors.oldPassword}</Text>
                  )}

                  <View>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#999"
                      style={[styles.input, { paddingRight: S(50) }]}
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
                      style={[styles.input, { paddingRight: S(50) }]}
                      secureTextEntry={!showConfirmPassword}
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
                  {errors.confirmPassword && touched.confirmPassword && (
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
                      <Text style={styles.buttonText}>Update password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

export default UpdatePasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {
    width: S(20),
    height: VS(20),
    tintColor: '#fff',
    resizeMode: 'contain',
    marginLeft: S(16),
  },
  brand: { color: '#fff', fontSize: MS(26), fontFamily: 'Helvetica-Bold' },
  content: { padding: MS(20) },
  title: {
    color: '#fff',
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    marginBottom: VS(6),
  },
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
    backgroundColor: '#fff',
    paddingVertical: VS(14),
    borderRadius: MS(10),
    alignItems: 'center',
    marginTop: VS(6),
  },
  buttonText: { color: '#000', fontFamily: 'Helvetica-Bold' },
  error: { color: '#ff7675', marginBottom: VS(8), fontFamily: 'Helvetica' },
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
