import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    Alert.alert('Verified', 'Code accepted');
    navigation.navigate('UpdatePassword', { email });
  };

  const resend = () => {
    if (seconds > 0) return;
    Alert.alert('Resent', 'Code resent (mock)');
    setSeconds(60);
    setDigits(['', '', '', '']);
    refs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
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
                placeholder="-"
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

          <View style={{ marginTop: 12, alignItems: 'center' }}>
            {seconds > 0 ? (
              <Text style={styles.timerText}>
                Resend code in 00:{String(seconds).padStart(2, '0')}
              </Text>
            ) : (
              <TouchableOpacity onPress={resend}>
                <Text style={{ color: '#D8FF00' }}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B0B' },
  header: { padding: 20, alignItems: 'center' },
  brand: { color: '#fff', fontSize: 26, fontWeight: '900' },
  content: { padding: 20 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
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
    backgroundColor: '#D8FF00',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: '#000', fontWeight: '800' },
  error: { color: '#ff7675', marginBottom: 8 },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#111',
    color: '#fff',
    fontSize: 22,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  timerText: { color: '#999' },
});
