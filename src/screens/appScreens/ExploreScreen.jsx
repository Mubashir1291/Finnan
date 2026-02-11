import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon10 from '../../utils/IconSizes';
import { ExploreIcon, MenuIcon, UserIcon } from '../../assets/Index';
import { S, VS, MS } from '../../utils/Responsive';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;
const DATA = [
  {
    id: '1',
    title: 'HAMZA IGAMANE BEST BITS 24/25',
    tag: 'Highlight',
    duration: '0:35',
    author: 'Hamza Igamane',
    image:
      'https://i.pinimg.com/736x/79/2d/e5/792de5a6528fe498b4545da58ae8c5f1.jpg',
  },
  {
    id: '2',
    title: 'Rodrigo Mora hits the FILTHY equalizer',
    tag: 'Goal',
    duration: '0:32',
    author: 'Rodrigo Mora',
    image:
      'https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-2256403885-20260129110315929.jpg?c=16x9&q=h_438,w_780,c_fill',
  },
  {
    id: '3',
    title: 'ETHAN NWANERI vs MAN CITY',
    tag: 'Goal',
    duration: '0:19',
    author: 'Ethan Nwaneri',
    image:
      'https://rukminim2.flixcart.com/image/480/480/kvr01ow0/wall-decoration/e/y/w/football-form-cristiano-ronaldo-player-wallpaper-poster-1-original-imag8kvtgzmmqrge.jpeg?q=90',
  },
  {
    id: '4',
    title: "Harvey Elliott's first Aston Villa goal",
    tag: 'Goal',
    duration: '0:37',
    author: 'Harvey Elliott',
    image:
      'https://static.toiimg.com/thumb/msid-123705146,imgsize-121032,width-400,resizemode-4/hkg-1-0-ind-2.jpg',
  },
];

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { store } from '../../redux/store';
import { setIsLogin } from '../../redux/Reducers/userReducer';

const ExploreScreen = () => {
  const navigation = useNavigation();
  const { isLogin, accessToken } = useSelector(state => state.user);
  console.log(accessToken, 'here is tokennnnnnnnnnnnnnnnnnnnnnn');

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <ImageBackground source={{ uri: item.image }} style={styles.image}>
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
      </ImageBackground>
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
              height: VS(30),
              width: S(30),
              tintColor: '#fff',
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>EXPLORE</Text>
        <TouchableOpacity
          onPress={() =>
            isLogin
              ? navigation.navigate('Profile')
              : store.dispatch(setIsLogin(false))
          }
        >
          <Image
            source={UserIcon}
            style={{
              height: VS(30),
              width: S(30),
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
        contentContainerStyle={{ padding: MS(12) }}
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
    height: VS(56),
    paddingHorizontal: S(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
  },
  icon: {
    color: '#fff',
    fontSize: MS(22),
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: MS(14),
    overflow: 'hidden',
    backgroundColor: '#111',
    marginBottom: VS(16),
  },

  image: {
    width: '100%',
    height: VS(220),
    justifyContent: 'flex-end',
  },

  tag: {
    position: 'absolute',
    top: VS(8),
    left: S(8),
    backgroundColor: '#fff',
    paddingHorizontal: S(10),
    paddingVertical: VS(4),
    borderRadius: MS(8),
  },
  tagText: {
    fontSize: MS(12),
    fontFamily: 'Helvetica-Bold',
  },

  duration: {
    position: 'absolute',
    top: VS(8),
    right: S(8),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: S(8),
    paddingVertical: VS(4),
    borderRadius: MS(8),
  },
  durationText: {
    color: '#fff',
    fontSize: MS(11),
    fontFamily: 'Helvetica',
  },

  textContainer: {
    padding: MS(10),
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    color: '#fff',
    fontSize: MS(13),
    fontFamily: 'Helvetica-Bold',
    lineHeight: MS(15),
  },
  authorBadge: {
    marginTop: VS(6),
    backgroundColor: '#1F1F1F',
    paddingHorizontal: S(10),
    paddingVertical: VS(4),
    borderRadius: MS(8),
    alignSelf: 'flex-start',
  },
  authorText: {
    color: 'white',
    fontSize: MS(10),
    fontFamily: 'Helvetica',
  },
});
