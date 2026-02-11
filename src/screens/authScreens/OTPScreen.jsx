import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { S, VS, MS } from '../../utils/Responsive';

const OTPScreen = ({ navigation, route }) => {
  const { email } = route.params || {};

  const [digits, setDigits] = useState(['', '', '', '']);
  const refs = useRef([]);
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState('');
  const isComplete = digits.every(d => d !== '');

  useEffect(() => {
    let timer;
    if (seconds > 0) {
      timer = setInterval(() => setSeconds(s => s - 1), 1000);
    }
    return () => timer && clearInterval(timer);
  }, [seconds > 0]);

  const onChangeDigit = (val, idx) => {
    const char = (val || '').slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[idx] = char;
    setDigits(newDigits);
    setError('');
    if (char && idx < 3) {
      refs.current[idx + 1]?.focus();
    }
  };

  const onKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        refs.current[idx - 1]?.focus();
        const newDigits = [...digits];
        newDigits[idx - 1] = '';
        setDigits(newDigits);
      }
    }
  };

  const verify = () => {
    const code = digits.join('');
    if (code.length < 4) {
      setError('Enter 4-digit code');
      return;
    }
    setError('');
    Toast.show({
      type: 'success',
      text1: 'Verified',
      text2: 'Code accepted',
      visibilityTime: 2500,
    });
    setTimeout(() => {
      navigation.navigate('UpdatePassword', { email });
    }, 2000);
  };

  const resend = () => {
    if (seconds > 0) return;
    Toast.show({
      type: 'info',
      text1: 'Resent',
      text2: 'Code resent to your email',
      visibilityTime: 2500,
    });
    setSeconds(60);
    setDigits(['', '', '', '']);
    refs.current[0]?.focus();
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
            <Text style={styles.title}>Enter verification code</Text>
            <Text style={styles.subtitle}>
              We sent a code to {email || 'your email'}
            </Text>

            <View style={{ width: '100%' }}>
              <View style={styles.otpContainer}>
                {[0, 1, 2, 3].map(i => (
                  <TextInput
                    key={i}
                    ref={el => (refs.current[i] = el)}
                    value={digits[i]}
                    onChangeText={val => onChangeDigit(val, i)}
                    onKeyPress={e => onKeyPress(e, i)}
                    style={styles.otpBox}
                    keyboardType="number-pad"
                    maxLength={1}
                    // placeholder="-"
                    placeholderTextColor="#444"
                    textAlign="center"
                    autoFocus={i === 0}
                  />
                ))}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.button, !isComplete && { opacity: 0.6 }]}
                onPress={verify}
                disabled={!isComplete}
              >
                <Text style={styles.buttonText}>Verify</Text>
              </TouchableOpacity>

              <View style={{ marginTop: VS(12), alignItems: 'center' }}>
                {seconds > 0 ? (
                  <Text style={styles.timerText}>
                    Resend code in 00:{String(seconds).padStart(2, '0')}
                  </Text>
                ) : (
                  <TouchableOpacity onPress={resend}>
                    <Text
                      style={{ color: '#D8FF00', fontFamily: 'Helvetica-Bold' }}
                    >
                      Resend code
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

export default OTPScreen;

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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: VS(12),
  },
  otpBox: {
    width: S(56),
    height: VS(56),
    borderRadius: MS(10),
    backgroundColor: '#111',
    color: '#fff',
    fontSize: MS(22),
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 0,
    borderWidth: MS(1),
    borderColor: '#222',
    fontFamily: 'Helvetica',
  },
  timerText: { color: '#999', fontFamily: 'Helvetica' },
});
