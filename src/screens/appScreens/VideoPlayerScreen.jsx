import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowBackIcon, BackArrowIcon } from '../../assets/Index';
import { MS, S, VS } from '../../utils/Responsive';
import { PrimaryColor, SecondaryColor } from '../../utils/Colors';

const { width, height } = Dimensions.get('window');

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Video
        source={{ uri: item?.video || item?.video_url }}
        style={styles.video}
        resizeMode="cover"
        repeat
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        controls={false}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={SecondaryColor} />
        </View>
      )}

      {/* Back Button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowBackIcon} style={styles.backIcon} />
        </TouchableOpacity>
      </SafeAreaView>

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

        <TouchableOpacity
          style={styles.viewDetailButton}
          onPress={() => navigation.navigate('Detail', { item })}
        >
          <Text style={styles.viewDetailText}>View Detail</Text>
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
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
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
    paddingBottom: VS(40),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderTopLeftRadius: MS(20),
    borderTopRightRadius: MS(20),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: VS(16),
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
  viewDetailButton: {
    backgroundColor: SecondaryColor,
    paddingVertical: VS(14),
    borderRadius: MS(30),
    alignItems: 'center',
    marginBottom: VS(16),
  },
  viewDetailText: {
    color: PrimaryColor,
    fontSize: MS(16),
    fontFamily: 'Helvetica-Bold',
  },
});
