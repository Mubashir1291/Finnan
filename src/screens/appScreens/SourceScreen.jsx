import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Linking,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackArrowIcon } from '../../assets/Index';
import {
  PrimaryColor,
  HeadingColor,
  SubHeadingColor,
  BorderColor,
  SecondaryColor,
} from '../../utils/Colors';
import { S, VS, MS } from '../../utils/Responsive';

const SourceScreen = ({ navigation, route }) => {
  const { sources } = route.params || { sources: [] };
  const [selectedUrl, setSelectedUrl] = useState(null);

  const handlePress = url => {
    setSelectedUrl(url);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handlePress(item.url)}>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.url} numberOfLines={1}>
        {item.url}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={BackArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sources</Text>
        <View style={{ width: S(20) }} />
      </View>
      <FlatList
        data={sources}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sources available</Text>
          </View>
        }
      />

      <Modal
        visible={!!selectedUrl}
        animationType="slide"
        onRequestClose={() => setSelectedUrl(null)}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedUrl(null)}>
              <Image source={BackArrowIcon} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Browser</Text>
            <View style={{ width: S(20) }} />
          </View>
          <WebView source={{ uri: selectedUrl }} style={{ flex: 1 }} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default SourceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrimaryColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: S(16),
    paddingVertical: VS(12),
    borderBottomWidth: 1,
    borderBottomColor: BorderColor,
  },
  backIcon: {
    width: S(20),
    height: VS(20),
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
  },
  list: {
    padding: MS(16),
  },
  item: {
    backgroundColor: '#1A1A1A',
    padding: MS(16),
    borderRadius: MS(12),
    marginBottom: VS(12),
    borderWidth: 1,
    borderColor: BorderColor,
  },
  title: {
    color: HeadingColor,
    fontSize: MS(14),
    fontFamily: 'Helvetica-Bold',
    marginBottom: VS(4),
  },
  url: {
    color: SecondaryColor,
    fontSize: MS(12),
    fontFamily: 'Manrope-Regular',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: VS(50),
  },
  emptyText: {
    color: SubHeadingColor,
    fontSize: MS(14),
    fontFamily: 'Manrope-Regular',
  },
});
