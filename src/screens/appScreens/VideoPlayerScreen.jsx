import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Pressable,
  FlatList,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowBackIcon } from '../../assets/Index';
import { MS, S, VS } from '../../utils/Responsive';
import { SecondaryColor } from '../../utils/Colors';

const { width, height } = Dimensions.get('window');

const VideoItem = ({ item, isActive }) => {
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const handleTogglePause = () => {
    setPaused(prev => !prev);
  };

  return (
    <View style={styles.videoContainer}>
      <Pressable onPress={handleTogglePause} style={styles.touchableOverlay}>
        <Video
          source={{ uri: item?.video || item?.video_url }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={!isActive || paused}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          controls={false}
        />
      </Pressable>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={SecondaryColor} />
        </View>
      )}

      {/* Bottom Detail View */}
      <View style={styles.bottomView}>
        <View style={styles.infoRow}>
          <View style={styles.textWrapper}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item?.title}
            </Text>
          </View>
          {/* Player Image / Thumbnail */}
          <Image source={{ uri: item?.image }} style={styles.playerImage} />
        </View>
      </View>
    </View>
  );
};

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { videos, startIndex = 0 } = route.params;
  const [activeVideoIndex, setActiveVideoIndex] = useState(startIndex);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== activeVideoIndex) {
        setActiveVideoIndex(newIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item, index }) => {
      return <VideoItem item={item} isActive={index === activeVideoIndex} />;
    },
    [activeVideoIndex],
  );

  const keyExtractor = useCallback(
    (item, index) => item?.id?.toString() || index.toString(),
    [],
  );

  const getItemLayout = useCallback(
    (data, index) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={startIndex}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        style={{ flex: 1 }}
        windowSize={3}
        maxToRenderPerBatch={1}
        initialNumToRender={1}
        removeClippedSubviews
      />

      {/* Back Button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowBackIcon} style={styles.backIcon} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default VideoPlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width,
    height,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: MS(16),
    zIndex: 2,
  },
  backButton: {
    padding: MS(8),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: MS(20),
  },
  backIcon: {
    width: S(20),
    height: VS(20),
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  bottomView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: MS(20),
    paddingBottom: VS(20),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: MS(20),
    borderTopRightRadius: MS(20),
    zIndex: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    paddingRight: S(12),
  },
  videoTitle: {
    color: '#fff',
    fontSize: MS(16),
    fontFamily: 'Helvetica-Bold',
  },
  playerImage: {
    width: MS(50),
    height: MS(50),
    borderRadius: MS(25),
    borderWidth: 1,
    borderColor: '#fff',
  },
  touchableOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
