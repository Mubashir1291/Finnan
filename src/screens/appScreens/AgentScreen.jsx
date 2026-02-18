import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
  useMemo,
  use,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import RenderHTML from 'react-native-render-html';
import {
  BorderColor,
  ButtonsColor,
  HeadingColor,
  InputBgColor,
  PrimaryColor,
  SecondaryColor,
  SubHeadingColor,
} from '../../utils/Colors';

import {
  ai,
  ArrowBackIcon,
  BackArrowIcon,
  CopyIcon,
  StarsIcon,
  ThumbIcon,
  wwwIcon,
} from '../../assets/Index';
import { userSession, AI_CHATTING_STREAM } from '../../services/config';
import { store } from '../../redux/store';
import { MS, S, VS } from '../../utils/Responsive';
import { Rating } from 'react-native-ratings';

const initialMessages = [
  {
    id: '1',
    role: 'bot',
    text: 'Hi! I’m Finnan — your autonomous football finance advisor. Want to model your contract, taxes, and investments?',
    text: 'Hi! I’m Finnan — your autonomous football finance advisor. Want to model your contract, taxes, and investments?',
  },
];

const OUTPUT_INSTRUCTIONS = `
🚫 Output Restrictions:

- DO NOT use any CSS or <style> tags.

- Output must be clean and readable without any styling or formatting instructions.

- Avoid inline styles, classes, or styled elements of any kind.

- Only use basic HTML elements like <div>, <p>, <ul>, <li>, <b>, <br>, <table>, <h4> etc etc if needed — no formatting enhancements beyond structure.

- The response should prioritize clarity, conciseness, and structure over appearance.`;

// ── Moved outside component to avoid re-creation on every render ──
const TAG_STYLES = {
  body: {
    fontFamily: 'Helvetica',
    color: HeadingColor,
    lineHeight: 22,
    fontSize: 14,
  },
  p: {
    fontFamily: 'Helvetica',
    marginVertical: 4,
    color: HeadingColor,
    lineHeight: 22,
    fontSize: 14,
  },
  b: { fontFamily: 'Helvetica-Bold', color: HeadingColor },
  strong: { fontFamily: 'Helvetica-Bold', color: HeadingColor },
  h1: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginVertical: 8,
  },
  h2: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginVertical: 6,
  },
  h3: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginVertical: 4,
  },
  h4: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginVertical: 4,
  },
  table: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  thead: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tbody: {},
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  th: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: HeadingColor,
    textAlign: 'center',
  },
  td: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: SubHeadingColor,
    textAlign: 'center',
  },
  ul: { marginVertical: 4, paddingLeft: 16 },
  li: { marginVertical: 2, color: HeadingColor, fontFamily: 'Helvetica' },
  a: { color: '#4da6ff', textDecorationLine: 'underline' },
};

const BASE_STYLE = {
  fontFamily: 'Helvetica',
  color: HeadingColor,
  fontSize: 14,
};
const IGNORED_TAGS = ['script', 'style', 'head', 'meta', 'link'];

// ── Memoized message — only re-renders when its own item changes ──
const ChatMessage = memo(
  ({ item, contentWidth, onPreviewImage, onFeedback, onShowSources }) => {
    const navigation = useNavigation();
    const isUser = item.role === 'user';
    let textForDisplay = item.text;

    // If the bot response is a tool result, we can't render the JSON.
    // So, we create a generic text and will extract sources from the original `item.text`.
    if (item.role === 'bot' && !item.thinking && item.text) {
      try {
        const parsed = JSON.parse(item.text);
        if (
          parsed.type === 'tool_result' &&
          parsed.data &&
          Array.isArray(parsed.data.search_results)
        ) {
          textForDisplay =
            "I've found some information for you. Check the sources for details.";
        }
      } catch (e) {
        // Not a JSON, use original text.
      }
    }

    let processedText = textForDisplay;
    if (typeof processedText === 'string') {
      processedText = processedText
        .replace(/\\n\\n/g, '<br/><br/>')
        .replace(/\\n/g, '<br/>')
        .trim();
    }

    const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images = [];
    let match;
    while ((match = imageRegex.exec(processedText)) !== null) {
      images.push(match[1]);
    }

    const textWithoutImages = processedText
      .replace(/<img[^>]*>/gi, '')
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
      .trim();
    const isHtml =
      typeof textWithoutImages === 'string' &&
      /<[^>]+>/.test(textWithoutImages);
    const hasTable =
      typeof textWithoutImages === 'string' &&
      /<table/i.test(textWithoutImages);

    // Extract sources from the text
    const sourceLinks = useMemo(() => {
      console.log(item, 'here is source response');
      if (!item.text || typeof item.text !== 'string') return [];

      // NEW: Handle tool_result JSON response for sources
      try {
        const parsed = JSON.parse(item.text);
        if (
          parsed.type === 'tool_result' &&
          parsed.data &&
          Array.isArray(parsed.data.search_results)
        ) {
          const sources = parsed.data.search_results.map(result => ({
            url: (result.url || '').replace(/"\s*$/, ''), // Clean trailing quote from example
            title: result.title || 'No Title',
            description: result.snippet || 'No Description',
          }));
          if (sources.length > 0) {
            return sources;
          }
        }
      } catch (e) {
        // Not a JSON, fall through to regex-based extraction
      }
      const links = [];
      const foundUrls = new Set();
      const imageUrls = [];

      const addLink = (url, title) => {
        let cleanUrl = url.trim();
        cleanUrl = cleanUrl.replace(/[.,;)]$/, '');

        // Filter out image URLs so they don't appear in the sources list
        if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(?:\?.*)?$/i.test(cleanUrl)) {
          imageUrls.push(cleanUrl);
          return;
        }

        if (!cleanUrl || foundUrls.has(cleanUrl)) return;
        foundUrls.add(cleanUrl);
        links.push({
          url: cleanUrl,
          title:
            title && title !== cleanUrl
              ? title.replace(/<[^>]+>/g, '').trim()
              : cleanUrl,
          description: 'Source from chat response',
        });
      };

      // 1. HTML Anchor tags
      const htmlRegex =
        /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^>\s]+))[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      while ((match = htmlRegex.exec(item.text)) !== null) {
        const url = match[1] || match[2] || match[3];
        const content = match[4];
        if (url) addLink(url, content);
      }

      // 2. Markdown Links
      const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      while ((match = markdownRegex.exec(item.text)) !== null) {
        addLink(match[2], match[1]);
      }

      // 3. Plain URLs (fallback)
      const urlRegex = /((?:https?:\/\/|www\.)[^\s<"'\)\]]+)/g;
      while ((match = urlRegex.exec(item.text)) !== null) {
        let url = match[1];
        if (url.startsWith('www.')) url = 'https://' + url;
        addLink(url, url);
      }

      // 4. Fallback: If no text sources found, but images exist, use image domains
      if (links.length === 0 && imageUrls.length > 0) {
        imageUrls.forEach(imgUrl => {
          try {
            const originMatch = imgUrl.match(
              /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im,
            );
            if (originMatch) {
              const domain = originMatch[0];
              const fullOrigin = domain.startsWith('http')
                ? domain
                : `https://${domain}`;
              if (!foundUrls.has(fullOrigin)) {
                foundUrls.add(fullOrigin);
                links.push({
                  url: fullOrigin,
                  title: 'Image Source',
                });
              }
            }
          } catch (e) {}
        });
      }
      return links;
    }, [item.text]);

    const imageGallery =
      images.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 8 }}
          contentContainerStyle={{ gap: 10 }}
        >
          {images.map((imgSrc, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => onPreviewImage(imgSrc)}
            >
              <Image
                source={{ uri: imgSrc }}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null;

    const htmlContent = textWithoutImages ? (
      <RenderHTML
        contentWidth={contentWidth}
        source={{ html: textWithoutImages }}
        baseStyle={BASE_STYLE}
        tagsStyles={TAG_STYLES}
        enableExperimentalBRCollapsing={true}
        ignoredDomTags={IGNORED_TAGS}
        renderersProps={{
          a: {
            onPress: (_, href) => {
              if (href) {
                Linking.openURL(href).catch(err =>
                  console.warn('Failed to open URL:', err),
                );
              }
            },
          },
        }}
      />
    ) : null;

    return (
      <View style={[styles.messageRow, isUser && styles.messageRowRight]}>
        <View style={styles.messageContent}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.bubbleUser : styles.bubbleBot,
            ]}
          >
            {item.thinking ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color={HeadingColor} />
                <Text style={styles.thinkingText}>{item.text}</Text>
              </View>
            ) : (
              <>
                {imageGallery}
                {isUser
                  ? textWithoutImages && (
                      <Text
                        style={[styles.messageText, styles.messageTextUser]}
                      >
                        {textWithoutImages}
                      </Text>
                    )
                  : textWithoutImages && (
                      <ScrollView
                        horizontal={hasTable}
                        showsHorizontalScrollIndicator={hasTable}
                        nestedScrollEnabled={true}
                      >
                        {htmlContent}
                      </ScrollView>
                    )}
              </>
            )}
          </View>

          {/* Copy button for bot messages */}
          {!isUser && !item.thinking && item.id !== '1' && (
            <View style={styles.actionButtonsContainer}>
              {/* Source Tag Button */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    const plainText = item.text
                      .replace(/<[^>]*>/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .replace(/&amp;/g, '&')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .trim();
                    Clipboard.setString(plainText);
                  }}
                >
                  <Image source={CopyIcon} style={styles.copyIcon} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (onFeedback) onFeedback(item);
                  }}
                >
                  <Image source={ThumbIcon} style={styles.copyIcon} />
                </TouchableOpacity>
              </View>
              {sourceLinks.length > 0 && (
                <TouchableOpacity
                  style={styles.sourceTag}
                  onPress={() => onShowSources(sourceLinks)}
                >
                  <Image
                    source={wwwIcon}
                    style={{
                      width: S(14),
                      height: VS(14),
                      resizeMode: 'contain',
                      tintColor: SubHeadingColor,
                    }}
                  />
                  <Text style={styles.sourceTagText}>
                    Sources ({sourceLinks.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  },
);

// ── Main component ──
export default function AgentScreen({ navigation, route }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const { prompt } = route.params || {};
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { width, height } = useWindowDimensions();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0);
  const [sourcesModalVisible, setSourcesModalVisible] = useState(false);
  const [currentSources, setCurrentSources] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const contentWidth = width - 80;

  // Refs for streaming debounce
  const streamBufferRef = useRef('');
  const streamTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  // Throttled scroll — max once per 300ms to avoid scroll storms
  const scrollToBottom = useCallback(() => {
    if (scrollTimerRef.current) return;
    scrollTimerRef.current = setTimeout(() => {
      scrollTimerRef.current = null;
      if (listRef.current) {
        listRef.current.scrollToEnd({ animated: true });
      }
    }, 300);
  }, []);

  useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (customText = null) => {
      const isCustom = typeof customText === 'string';
      const textToSend = isCustom ? customText : input;

      if (!textToSend.trim()) return;
      const userMsg = {
        id: String(Date.now()),
        role: 'user',
        text: textToSend.trim(),
      };
      setMessages(prev => [...prev, userMsg]);
      if (!isCustom) setInput('');

      const thinkingId = `thinking-${Date.now()}`;
      const thinkingMsg = {
        id: thinkingId,
        role: 'bot',
        text: 'Thinking...',
        thinking: true,
      };
      setMessages(prev => [...prev, thinkingMsg]);

      (async () => {
        if (!session) {
          console.warn('No session — cannot send to AI.');
          setMessages(prev =>
            prev.map(m =>
              m.id === thinkingId
                ? { ...m, text: 'No AI session', thinking: false }
                : m,
            ),
          );
          return;
        }

        const payload = {
          agent_id: 'ab819286-74f4-4cec-ba2d-adce02c00432',
          session_id: session,
          query: `${userMsg.text}\n\n${OUTPUT_INSTRUCTIONS}`,
        };

        try {
          setIsLoading(true);
          streamBufferRef.current = '';

          // Tool status callback: show which tool is being used
          const onToolStatus = status => {
            setMessages(prev =>
              prev.map(m =>
                m.id === thinkingId
                  ? { ...m, text: status, thinking: true }
                  : m,
              ),
            );
          };

          // Streaming callback: progressively update the bot message
          const onChunk = accumulated => {
            streamBufferRef.current = accumulated;

            // Debounce UI updates to ~200ms to avoid excessive re-renders
            if (!streamTimerRef.current) {
              streamTimerRef.current = setTimeout(() => {
                streamTimerRef.current = null;
                const currentText = streamBufferRef.current;
                if (currentText) {
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === thinkingId
                        ? { ...m, text: currentText, thinking: false }
                        : m,
                    ),
                  );
                }
              }, 200);
            }
          };

          const finalText = await AI_CHATTING_STREAM(
            payload,
            onChunk,
            onToolStatus,
          );

          // Clear any pending timer and do a final update
          if (streamTimerRef.current) {
            clearTimeout(streamTimerRef.current);
            streamTimerRef.current = null;
          }

          const cleanedText = (finalText || '')
            .replace(/\[object Object\]/g, '')
            .trim();

          console.log('AI Response received, text length:', cleanedText.length);
          setMessages(prev =>
            prev.map(m =>
              m.id === thinkingId
                ? {
                    ...m,
                    text: cleanedText || 'No response received.',
                    thinking: false,
                  }
                : m,
            ),
          );
        } catch (err) {
          console.log('AI chat error:', err);
          if (streamTimerRef.current) {
            clearTimeout(streamTimerRef.current);
            streamTimerRef.current = null;
          }
          setMessages(prev =>
            prev.map(m =>
              m.id === thinkingId
                ? {
                    ...m,
                    text: err?.message || 'Sorry, something went wrong.',
                    thinking: false,
                  }
                : m,
            ),
          );
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [input, session],
  );

  useEffect(() => {
    CreateSession();
  }, []);

  const lastSentPromptRef = useRef(null);
  useEffect(() => {
    if (prompt && session && lastSentPromptRef.current !== prompt) {
      lastSentPromptRef.current = prompt;
      handleSend(prompt);
    }
  }, [prompt, session, handleSend]);

  const CreateSession = async () => {
    const aiToken = store.getState()?.user?.aiToken;
    if (!aiToken) {
      console.log(
        'AI token missing — skip creating session. Call AI login first.',
      );
      return;
    }
    const obj = {
      platform_id: 'interdiscvr',
      agent_id: 'ab819286-74f4-4cec-ba2d-adce02c00432',
      mode: 'agent',
    };
    try {
      const response = await userSession(obj);
      console.log('Session created:', response);
      setSession(response?.session_id);
    } catch (error) {
      console.log('Error creating session:', error);
    }
  };

  const handlePreviewImage = useCallback(imgSrc => {
    setPreviewImage(imgSrc);
  }, []);

  const handleFeedback = useCallback(() => {
    setFeedbackModalVisible(true);
  }, []);

  const handleShowSources = useCallback(sources => {
    setCurrentSources(sources);
    setSourcesModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <ChatMessage
        item={item}
        contentWidth={contentWidth}
        onPreviewImage={handlePreviewImage}
        onFeedback={handleFeedback}
        onShowSources={handleShowSources}
      />
    ),
    [contentWidth, handlePreviewImage, handleFeedback, handleShowSources],
  );

  const keyExtractor = useCallback(item => item.id, []);

  const handleStartNewConversation = useCallback(() => {
    setMessages(initialMessages);
  }, []);
  const handleFeedbackSubmit = useCallback(() => {
    // Here you would send `rating` and `feedbackText` to your backend or analytics service
    console.log('Feedback submitted:', { rating, feedbackText });
    setFeedbackModalVisible(false);
    Toast.show({
      type: 'success',
      text1: 'Feedback Submitted!',
      visibilityTime: 2500,
      position: 'top',
    });
  }, [rating, feedbackText]);

  return (
    <View style={{ flex: 1, backgroundColor: PrimaryColor }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 30}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Image source={BackArrowIcon} style={styles.iconSmall} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FINNAN</Text>
          <TouchableOpacity style={{ width: '5%' }} activeOpacity={0.7}>
            {/* Placeholder for right side */}
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={7}
          ListHeaderComponent={
            <>
              <View style={styles.headerSection}>
                <View style={styles.titleRow}>
                  <Text style={styles.mainTitle}>ASK Finnan</Text>
                  <Image source={StarsIcon} style={styles.titleIcon} />
                </View>
                <Text style={styles.subtitle}>
                  The Global Football Master Agent. Powered by AI.{'\n'}Informed
                  by Data.
                </Text>
                <TouchableOpacity
                  style={styles.newConversationButton}
                  onPress={handleStartNewConversation}
                >
                  <Text style={styles.newConversationText}>
                    Start a new conversation
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask Anything from Finnan..."
            placeholderTextColor={SubHeadingColor}
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
          />
          <TouchableOpacity
            style={{ ...styles.sendButton, opacity: isLoading ? 0.7 : 1 }}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview Modal */}
        <Modal
          visible={!!previewImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPreviewImage(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setPreviewImage(null)}
          >
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={{
                  width: width - 40,
                  height: height * 0.7,
                  borderRadius: 12,
                }}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setPreviewImage(null)}
            >
              <Text
                style={{ color: '#fff', fontSize: MS(15), fontWeight: 'bold' }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Modal>

        <Modal
          visible={feedbackModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFeedbackModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setFeedbackModalVisible(false)}
          >
            <Pressable style={styles.feedbackModalContainer}>
              <Text style={styles.feedbackTitle}>Rate this response</Text>
              <View style={styles.ratingContainer}>
                <Rating
                  type="star"
                  ratingCount={5}
                  imageSize={40}
                  tintColor={InputBgColor}
                  onFinishRating={setRating}
                  startingValue={0}
                />
              </View>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Tell us more..."
                placeholderTextColor={SubHeadingColor}
                value={feedbackText}
                onChangeText={setFeedbackText}
              />
              <TouchableOpacity
                style={styles.submitFeedbackButton}
                onPress={handleFeedbackSubmit}
              >
                <Text style={styles.submitFeedbackText}>Submit Feedback</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Sources List Modal */}
        <Modal
          visible={sourcesModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSourcesModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.sourcesModal}
            activeOpacity={1}
            onPress={() => setSourcesModalVisible(false)}
          >
            <View style={styles.bottomSheetContainer}>
              <View style={styles.bottomSheetHandle} />
              {/* <Text style={styles.bottomSheetTitle}>Sources</Text> */}
              <FlatList
                showsVerticalScrollIndicator={false}
                data={currentSources}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  console.log(item, 'itemmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm'),
                  (
                    <TouchableOpacity
                      style={styles.sourceItem}
                      onPress={() => setSelectedUrl(item.url)}
                    >
                      <Text style={styles.sourceTitle} numberOfLines={2}>
                        {item?.title}
                      </Text>
                      <Text style={styles.sourceDescription} numberOfLines={3}>
                        {item?.snippet}
                      </Text>
                      <Text style={styles.sourceUrl} numberOfLines={1}>
                        {item?.url}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* WebView Modal */}
        <Modal
          visible={!!selectedUrl}
          animationType="slide"
          onRequestClose={() => setSelectedUrl(null)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: PrimaryColor }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSelectedUrl(null)}>
                <Image source={ArrowBackIcon} style={styles.iconSmall} />
              </TouchableOpacity>
              {/* <Text style={styles.headerTitle}>Browser</Text> */}
              <View style={{ width: 20 }} />
            </View>
            <WebView source={{ uri: selectedUrl }} style={{ flex: 1 }} />
          </SafeAreaView>
        </Modal>

        <Toast />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrimaryColor,
  },
  header: {
    height: VS(60),
    backgroundColor: PrimaryColor,
    paddingHorizontal: S(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    marginTop: VS(5),
  },
  iconSmall: {
    width: S(20),
    height: VS(20),
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  newConversationButton: {
    alignSelf: 'flex-start',
    borderWidth: MS(1),
    borderColor: BorderColor,
    borderRadius: MS(20),
    paddingHorizontal: S(16),
    paddingVertical: VS(10),
    marginBottom: VS(10),
  },
  newConversationText: {
    color: HeadingColor,
    fontSize: MS(14),
    fontFamily: 'Helvetica',
  },
  listContent: {
    padding: MS(16),
    paddingBottom: VS(20),
  },
  askJoseAi: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S(16),
    paddingVertical: VS(12),
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: VS(8),
    alignItems: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageContent: {
    flex: 1,
    maxWidth: '100%',
  },
  bubble: {
    paddingHorizontal: S(14),
    paddingVertical: VS(12),
    borderRadius: MS(16),
  },
  bubbleBot: {
    backgroundColor: ButtonsColor,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#ffff',
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: MS(14),
    color: HeadingColor,
    lineHeight: VS(20),
    fontFamily: 'Helvetica',
  },
  messageTextUser: {
    color: PrimaryColor,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    color: SubHeadingColor,
    fontSize: MS(14),
    fontFamily: 'Helvetica',
  },
  galleryImage: {
    width: S(180),
    height: VS(140),
    borderRadius: MS(12),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: VS(8),
    marginLeft: S(4),
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: 'rgba(255,255,255,0.05)',
  },
  actionButton: {
    padding: MS(4),
  },
  copyIcon: {
    width: S(18),
    height: VS(18),
    resizeMode: 'contain',
    tintColor: SubHeadingColor,
  },
  inputRow: {
    flexDirection: 'row',
    padding: MS(10),
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    color: HeadingColor,
    fontFamily: 'Helvetica',
    flex: 1,
    minHeight: VS(40),
    maxHeight: VS(120),
    paddingHorizontal: S(12),
    paddingVertical: VS(8),
    backgroundColor: BorderColor,
    borderRadius: MS(24),
    borderColor: SubHeadingColor,
    borderWidth: MS(1),
  },
  sendButton: {
    width: MS(44),
    height: MS(44),
    borderRadius: MS(22),
    backgroundColor: PrimaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: S(10),
    borderColor: SubHeadingColor,
    borderWidth: MS(1),
  },
  sendIcon: {
    fontSize: MS(17),
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourcesModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourcesModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: MS(50),
    right: MS(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: MS(20),
    height: MS(30),
    width: MS(30),
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSection: {
    paddingHorizontal: S(4),
    paddingTop: VS(8),
    paddingBottom: VS(20),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MS(8),
    marginBottom: VS(8),
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: VS(20),
  },
  mainTitle: {
    fontSize: MS(28),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    letterSpacing: 1,
  },
  titleIcon: {
    width: S(24),
    height: VS(24),
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: MS(14),
    color: SubHeadingColor,
    lineHeight: VS(20),
    marginBottom: VS(16),
    fontFamily: 'Helvetica',
  },
  feedbackModalContainer: {
    width: '85%',
    backgroundColor: InputBgColor,
    borderRadius: MS(16),
    padding: MS(20),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BorderColor,
  },
  feedbackTitle: {
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    color: HeadingColor,
    marginBottom: VS(20),
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: VS(20),
    gap: MS(12),
  },
  starIcon: {
    width: S(30),
    height: VS(30),
  },
  feedbackInput: {
    width: '100%',
    height: VS(100),
    backgroundColor: PrimaryColor,
    borderRadius: MS(8),
    padding: MS(12),
    color: HeadingColor,
    textAlignVertical: 'top',
    marginBottom: VS(20),
    borderWidth: 1,
    borderColor: BorderColor,
    fontSize: MS(14),
    fontFamily: 'Helvetica',
  },
  submitFeedbackButton: {
    backgroundColor: SecondaryColor,
    paddingVertical: VS(12),
    paddingHorizontal: S(30),
    borderRadius: MS(25),
  },
  submitFeedbackText: {
    color: PrimaryColor,
    fontFamily: 'Helvetica-Bold',
    fontSize: MS(16),
  },
  sourceTag: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceTagText: {
    color: SubHeadingColor,
    fontSize: MS(13),
    fontFamily: 'Helvetica-Bold',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: MS(20),
    borderTopRightRadius: MS(20),
    padding: MS(20),
    paddingBottom: MS(40),
    maxHeight: '60%',
  },
  bottomSheetHandle: {
    width: S(40),
    height: VS(4),
    backgroundColor: '#555',
    borderRadius: MS(2),
    alignSelf: 'center',
    marginBottom: VS(15),
  },
  bottomSheetTitle: {
    fontSize: MS(18),
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    marginBottom: VS(15),
    textAlign: 'center',
  },
  sourceItem: {
    paddingVertical: VS(12),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sourceTitle: {
    color: '#fff',
    fontSize: MS(14),
    fontFamily: 'Helvetica-Bold',
    marginBottom: VS(4),
  },
  sourceDescription: {
    color: SubHeadingColor,
    fontSize: MS(12),
    fontFamily: 'Helvetica',
    marginBottom: VS(6),
  },
  sourceUrl: {
    color: SubHeadingColor,
    fontSize: MS(12),
    fontFamily: 'Helvetica',
    textDecorationLine: 'underline',
  },
});
