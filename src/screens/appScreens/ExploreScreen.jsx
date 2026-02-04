import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon10 from '../../utils/IconSizes';
import { ExploreIcon, MenuIcon, UserIcon } from '../../assets/Index';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;

const DATA = [
  {
    id: '1',
    title: 'HAMZA IGAMANE BEST BITS 24/25',
    tag: 'Highlight',
    duration: '0:35',
    author: 'Hamza Igamane',
    image: 'https://via.placeholder.com/300x500',
  },
  {
    id: '2',
    title: 'Rodrigo Mora hits the FILTHY equalizer',
    tag: 'Goal',
    duration: '0:32',
    author: 'Rodrigo Mora',
    image: 'https://via.placeholder.com/300x500',
  },
  {
    id: '3',
    title: 'ETHAN NWANERI vs MAN CITY',
    tag: 'Goal',
    duration: '0:19',
    author: 'Ethan Nwaneri',
    image: 'https://via.placeholder.com/300x500',
  },
  {
    id: '4',
    title: "Harvey Elliott's first Aston Villa goal",
    tag: 'Goal',
    duration: '0:37',
    author: 'Harvey Elliott',
    image: 'https://via.placeholder.com/300x500',
  },
];

import { useNavigation } from '@react-navigation/native';

const ExploreScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Tag */}
      <View style={styles.tag}>
        <Text style={styles.tagText}>{item.tag}</Text>
      </View>

      {/* Duration */}
      <View style={styles.duration}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <View style={styles.authorBadge}>
          <Text style={styles.authorText}>{item.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image
            source={MenuIcon}
            style={{
              height: 30,
              width: 30,
              tintColor: '#fff',
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>EXPLORE</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Auth', { screen: 'SignInScreen' })
          }
        >
          <Image
            source={UserIcon}
            style={{
              height: 30,
              width: 30,
              tintColor: '#fff',
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  icon: {
    color: '#fff',
    fontSize: 22,
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#111',
    marginBottom: 16,
  },

  image: {
    width: '100%',
    height: 220,
  },

  tag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },

  duration: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
  },

  textContainer: {
    padding: 10,
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  authorBadge: {
    marginTop: 6,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  authorText: {
    color: 'white',
    fontSize: 10,
  },
});
