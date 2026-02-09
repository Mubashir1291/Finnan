import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowIcon, MenuIcon, UserIcon } from '../../assets/Index';
import axios from 'axios';
import { Icon16, Icon18, Icon22 } from '../../utils/IconSizes';
import { setIsLogin } from '../../redux/Reducers/userReducer';
import { store } from '../../redux/store';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 18;
const CARD_HEIGHT = 260;

const DiscoverScreen = () => {
  const navigation = useNavigation();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLogin } = useSelector(state => state.user);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await axios.get(
          'https://finnanftb.com/wp-json/getsearchprompts/v1/get-search-prompts',
        );

        console.log(response.data, 'here is response');
        setPrompts(response.data);
      } catch (error) {
        console.error(
          'Failed to fetch prompts:',
          error.response?.data || error.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AgentScreen', { prompt: item?.prompt_title })
      }
      activeOpacity={0.9}
      style={styles.card}
    >
      <ImageBackground source={{ uri: item?.image }} style={styles.image}>
        {/* Bottom Gradient Overlay */}
        <View style={styles.overlay}>
          <Text numberOfLines={2} style={styles.question}>
            {item?.prompt_title}
          </Text>

          {/* Arrow Button */}
          <View style={{ alignItems: 'flex-end', marginTop: 'auto' }}>
            <View style={styles.arrowButton}>
              <Image source={ArrowIcon} style={Icon22} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image source={MenuIcon} style={styles.headerIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DISCOVER</Text>
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
                height: 30,
                width: 30,
                tintColor: '#fff',
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

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
            isLogin
              ? navigation.navigate('Profile')
              : store.dispatch(setIsLogin(false))
          }
        >
          <Image source={UserIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={prompts}
        renderItem={renderItem}
        // keyExtractor={item => item.id.toString()}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 30,
    height: 30,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  overlay: {
    flexDirection: 'column',
    width: '90%',
    height: 100,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginBottom: 12,
    borderRadius: 12,
  },

  question: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 20,
    paddingRight: 40,
  },

  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#D8FF00', // neon yellow
    justifyContent: 'center',
    alignItems: 'center',
  },
});
