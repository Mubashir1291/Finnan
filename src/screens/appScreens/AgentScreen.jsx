import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
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
import Clipboard from '@react-native-clipboard/clipboard';
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
  BackArrowIcon,
  CopyIcon,
  StarsIcon,
  ThumbIcon,
} from '../../assets/Index';
import { userSession, AI_CHATTING_STREAM } from '../../services/config';
import { store } from '../../redux/store';
import { MS, S, VS } from '../../utils/Responsive';
import { Rating } from 'react-native-ratings';

const initialMessages = [
  {
    id: '1',
    role: 'bot',
    text: "Hi! I'm Finnan , your football agent. Ready to explore transfers and stats?",
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
  ({ item, contentWidth, onPreviewImage, onFeedback }) => {
    const isUser = item.role === 'user';

    let processedText = item.text;
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

    const textWithoutImages = processedText.replace(/<img[^>]*>/gi, '').trim();
    const isHtml =
      typeof textWithoutImages === 'string' &&
      /<[^>]+>/.test(textWithoutImages);
    const hasTable =
      typeof textWithoutImages === 'string' &&
      /<table/i.test(textWithoutImages);

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
          {/* Copy button for bot messages */}
          {!isUser && !item.thinking && item.id !== '1' && (
            <View style={styles.actionButtonsContainer}>
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

  const renderItem = useCallback(
    ({ item }) => (
      <ChatMessage
        item={item}
        contentWidth={contentWidth}
        onPreviewImage={handlePreviewImage}
        onFeedback={handleFeedback}
      />
    ),
    [contentWidth, handlePreviewImage, handleFeedback],
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
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
    height: 60,
    backgroundColor: PrimaryColor,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginTop: VS(5),
  },
  iconSmall: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  newConversationButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: BorderColor,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
  },
  newConversationText: {
    color: HeadingColor,
    fontSize: 14,
    fontFamily: 'Helvetica',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  askJoseAi: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 8,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
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
    fontSize: 14,
    color: HeadingColor,
    lineHeight: 20,
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
    fontSize: 14,
    fontFamily: 'Helvetica',
  },
  galleryImage: {
    width: 180,
    height: 140,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  copyIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: SubHeadingColor,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: ButtonsColor,
    alignItems: 'center',
  },
  input: {
    color: HeadingColor,
    fontFamily: 'Helvetica',
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BorderColor,
    borderRadius: 24,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SecondaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendIcon: {
    fontSize: 20,
    color: PrimaryColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
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
    tintColor: SecondaryColor,
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
});
