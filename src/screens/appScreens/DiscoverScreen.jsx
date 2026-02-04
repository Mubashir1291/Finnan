import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MenuIcon, UserIcon } from '../../assets/Index';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 18;
const CARD_HEIGHT = 260;

const DATA = [
  {
    id: '1',
    question: '"How do I create more progressive passes?"',
    image: 'https://via.placeholder.com/500x700',
  },
  {
    id: '2',
    question: '"Explain how to defend 2v1 transitions for my role"',
    image: 'https://via.placeholder.com/500x700',
  },
  {
    id: '3',
    question: '"What were my biggest mistakes last game?"',
    image: 'https://via.placeholder.com/500x700',
  },
  {
    id: '4',
    question: '"How did I perform last match?"',
    image: 'https://via.placeholder.com/500x700',
  },
];

const DiscoverScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Bottom Gradient Overlay */}
      <View style={styles.overlay}>
        <Text numberOfLines={3} style={styles.question}>
          {item.question}
        </Text>

        {/* Arrow Button */}
        <View style={styles.arrowButton}>
          <Text style={styles.arrow}>↗</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={MenuIcon} style={styles.headerIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>DISCOVER</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Auth', { screen: 'SignInScreen' })
          }
        >
          <Image source={UserIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },

  headerIcon: {
    width: 26,
    height: 26,
    tintColor: '#fff',
    resizeMode: 'contain',
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#111',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  question: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    paddingRight: 40,
  },

  arrowButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#D8FF00', // neon yellow
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrow: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
});
