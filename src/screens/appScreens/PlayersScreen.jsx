import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';

const PlayersScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Players</Text>
        <Text style={styles.sub}>
          This is a placeholder screen for Players.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default PlayersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Helvetica-Bold' },
  sub: { color: '#ccc', marginTop: 8, fontFamily: 'Helvetica-light' },
});
