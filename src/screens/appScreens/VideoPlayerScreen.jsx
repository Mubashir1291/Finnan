import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  ArrowBackIcon,
  VolumeCloseIcon,
  VolumeUpIcon,
} from '../../assets/Index';
import { MS, S, VS } from '../../utils/Responsive';

// Using 'screen' instead of 'window' to bypass status bar/navigation bar height issues
const { width, height } = Dimensions.get('screen');

const VideoItem = ({ item, isActive }) => {
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isActive) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [isActive]);

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  return (
    <View style={styles.videoContainer}>
      <Pressable onPress={handleTogglePause} style={styles.touchableOverlay}>
        <Video
          key={
            isActive ? `video-${item?.id}-active` : `video-${item?.id}-inactive`
          }
          source={{ uri: item?.video || item?.video_url }}
          style={styles.video}
          resizeMode="cover" // This stretches the video to fill the 'height'
          repeat
          paused={!isActive || isPaused}
          muted={isMuted}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          controls={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          shutterColor="transparent"
        />
      </Pressable>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={'#fff'} />
        </View>
      )}

      {/* Adjusting bottom padding based on device safe area (e.g., iPhone notch) */}
      <View
        style={[styles.bottomView, { paddingBottom: insets.bottom + VS(30) }]}
      >
        <View style={styles.infoRow}>
          <Image source={{ uri: item?.image }} style={styles.playerImage} />

          <View style={styles.textWrapper}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item?.title}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => setIsMuted(prev => !prev)}
          >
            <Image
              source={isMuted ? VolumeCloseIcon : VolumeUpIcon}
              style={styles.volumeIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { videos, startIndex = 0 } = route.params;

  const [activeVideoIndex, setActiveVideoIndex] = useState(startIndex);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null) {
        setActiveVideoIndex(newIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderItem = useCallback(
    ({ item, index }) => (
      <VideoItem
        item={item}
        isActive={index === activeVideoIndex && isFocused}
      />
    ),
    [activeVideoIndex, isFocused],
  );

  const keyExtractor = useCallback(
    (item, index) => item?.id?.toString() || index.toString(),
    [],
  );

  const getItemLayout = useCallback(
    (_, index) => ({
      length: height,
      offset: height * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Translucent ensures the video renders UNDER the status bar area */}
      <StatusBar
        hidden={false}
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

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
        windowSize={3}
        maxToRenderPerBatch={1}
        initialNumToRender={1}
        removeClippedSubviews={Platform.OS === 'android'}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
      />

      {/* Positioned back button based on top safe area */}
      <View style={[styles.header, { top: insets.top + MS(10) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowBackIcon} style={styles.backIcon} />
        </TouchableOpacity>
      </View>
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
    width: width,
    height: height,
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
    left: MS(16),
    zIndex: 10,
  },
  backButton: {
    padding: MS(8),
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: MS(25),
  },
  backIcon: {
    width: S(22),
    height: VS(22),
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  bottomView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: MS(20),
    zIndex: 2,
  },
  infoRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  textWrapper: {
    width: '80%',
    marginBottom: VS(10),
  },
  videoTitle: {
    color: '#fff',
    fontSize: MS(16),
    fontWeight: '600',
  },
  volumeButton: {
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: VS(10),
    right: 0,
  },
  volumeIcon: {
    width: S(28),
    height: VS(28),
    tintColor: '#fff',
  },
  playerImage: {
    width: MS(45),
    height: MS(45),
    borderRadius: MS(22.5),
    borderWidth: 1.5,
    borderColor: '#fff',
    marginBottom: VS(12),
  },
  touchableOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
