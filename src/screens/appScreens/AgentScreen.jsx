import React, { useState, useRef, useEffect } from 'react';
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
import Clipboard from '@react-native-clipboard/clipboard';
import RenderHTML from 'react-native-render-html';
import {
  PrimaryColor,
  SecondaryColor,
  HeadingColor,
  SubHeadingColor,
  BorderColor,
  ButtonsColor,
  BotBubbleColor,
  UserBubbleColor,
  InputBgColor,
} from '../../utils/Colors';
import { StarsIcon, MenuIcon, CopyIcon, ThumbIcon } from '../../assets/Index';
import { CHAT, SESSION_AI } from '../../services/AppServices';
import { AI_CHATTING, userSession } from '../../services/config';
import { store } from '../../redux/store';
import { Rating } from 'react-native-ratings';
import { MS, S, VS } from '../../utils/Responsive';

const initialMessages = [
  {
    id: '1',
    role: 'bot',
    text: "Hi! I'm Finnan , your football agent. Ready to explore transfers and stats?",
  },
];

export default function AgentScreen({ navigation, route }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { width, height } = useWindowDimensions();
  const { prompt } = route.params || {};
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedMessageForFeedback, setSelectedMessageForFeedback] =
    useState(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  console.log(prompt, 'this is prompt');

  useEffect(() => {
    const initChat = async () => {
      let currentSession = session;
      // If no session exists, create one
      if (!currentSession) {
        currentSession = await CreateSession();
      }

      // If we have a prompt and a valid session, send the message
      if (prompt && currentSession) {
        // Small delay to ensure UI is ready
        setTimeout(() => {
          handleSend(prompt, currentSession);
        }, 500);
      }
    };

    initChat();
  }, [prompt]);

  const CreateSession = async () => {
    const obj = {
      platform_id: 'interdiscvr',
      agent_id: 'ab819286-74f4-4cec-ba2d-adce02c00432',
      mode: 'agent',
    };

    try {
      const response = await SESSION_AI(obj);
      console.log(response, 'this is session response');
      setSession(response?.session_id);
      return response?.session_id;
    } catch (error) {
      console.log(error, 'this is session error');
      return null;
    }
  };

  // useEffect(() => {
  //   CreateSession();
  // }, []);

  useEffect(() => {
    if (listRef.current && messages.length) {
      setTimeout(() => listRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = (text = null, manualSessionId = null) => {
    const textToSend = typeof text === 'string' ? text : input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: String(Date.now()),
      role: 'user',
      text: textToSend.trim(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (!text) setInput(''); // Only clear input if we used the input state

    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMsg = {
      id: thinkingId,
      role: 'bot',
      text: 'Thinking...',
      thinking: true,
    };
    setMessages(prev => [...prev, thinkingMsg]);

    (async () => {
      let activeSession = manualSessionId || session;

      if (!activeSession) {
        activeSession = await CreateSession();
      }

      if (!activeSession) {
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
        session_id: activeSession,
        query: userMsg.text,
      };

      try {
        const res = await AI_CHATTING(payload);

        const extractText = value => {
          if (typeof value === 'string') return value;
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            if (value.image || value.img || value.src || value.url) {
              const imgSrc = value.image || value.img || value.src || value.url;
              if (
                typeof imgSrc === 'string' &&
                (imgSrc.startsWith('http') || imgSrc.startsWith('data:'))
              ) {
                const alt =
                  value.alt || value.title || value.caption || 'Image';
                return `<img src="${imgSrc}" alt="${alt}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
              }
            }
            if (value.images && Array.isArray(value.images)) {
              return value.images
                .map(img => {
                  const imgSrc =
                    typeof img === 'string'
                      ? img
                      : img.url || img.src || img.image;
                  if (imgSrc) {
                    return `<img src="${imgSrc}" alt="Image" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />`;
                  }
                  return '';
                })
                .filter(Boolean)
                .join('');
            }
            if (value.text) return extractText(value.text);
            if (value.content) return extractText(value.content);
            if (value.html) return extractText(value.html);
            if (value.message) return extractText(value.message);
            if (value.output) return extractText(value.output);
            if (Array.isArray(value)) {
              return value
                .map(v => extractText(v))
                .filter(Boolean)
                .join('');
            }
            const keys = Object.keys(value);
            if (keys.length === 0) return '';
            let result = '';
            for (const key of keys) {
              const extracted = extractText(value[key]);
              if (extracted && extracted !== '[object Object]') {
                result += extracted;
              }
            }
            return result || '';
          }
          return String(value);
        };

        let botText = extractText(
          res?.output ||
            res?.message ||
            res?.reply ||
            res?.data?.output ||
            res?.data?.message ||
            res,
        );

        botText = botText.replace(/\[object Object\]/g, '').trim();

        setMessages(prev =>
          prev.map(m =>
            m.id === thinkingId ? { ...m, text: botText, thinking: false } : m,
          ),
        );
      } catch (err) {
        console.log('AI chat error:', err);
        setMessages(prev =>
          prev.map(m =>
            m.id === thinkingId
              ? { ...m, text: 'Sorry, something went wrong.', thinking: false }
              : m,
          ),
        );
      }
    })();
  };

  const handleStartNewConversation = () => {
    setMessages(initialMessages);
  };

  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', {
      messageId: selectedMessageForFeedback?.id,
      rating: rating,
      feedback: feedbackText,
    });
    // TODO: Send feedback to your API

    // Reset and close
    setFeedbackModalVisible(false);
    setRating(0);
    setFeedbackText('');
    setSelectedMessageForFeedback(null);
  };

  const renderItem = ({ item }) => {
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

    const tagsStyles = {
      body: {
        color: HeadingColor,
        lineHeight: 22,
        fontSize: MS(14),
        fontFamily: 'Helvetica',
      },
      p: {
        marginVertical: VS(4),
        color: HeadingColor,
        lineHeight: 22,
        fontSize: MS(14),
        fontFamily: 'Helvetica',
      },
      b: { fontFamily: 'Helvetica-Bold', color: HeadingColor },
      strong: { fontFamily: 'Helvetica-Bold', color: HeadingColor },
      h1: {
        fontSize: MS(20),
        fontFamily: 'Helvetica-Bold',
        color: HeadingColor,
        marginVertical: VS(8),
      },
      h2: {
        fontSize: MS(18),
        fontFamily: 'Helvetica-Bold',
        color: HeadingColor,
        marginVertical: VS(6),
      },
      h3: {
        fontSize: MS(16),
        fontFamily: 'Helvetica-Bold',
        color: HeadingColor,
        marginVertical: VS(4),
      },
      h4: {
        fontSize: MS(15),
        fontFamily: 'Helvetica-Bold',
        color: HeadingColor,
        marginVertical: VS(4),
      },
      table: { marginVertical: VS(12), width: '100%' },
      tr: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
      },
      th: {
        paddingVertical: VS(8),
        paddingHorizontal: S(8),
        fontFamily: 'Helvetica-Bold',
        fontSize: MS(13),
        color: HeadingColor,
        minWidth: S(80),
      },
      td: {
        paddingVertical: VS(8),
        paddingHorizontal: S(8),
        fontSize: MS(13),
        color: SubHeadingColor,
        minWidth: S(80),
        fontFamily: 'Helvetica',
      },
      ul: {
        marginVertical: VS(4),
        paddingLeft: S(16),
        fontFamily: 'Helvetica',
      },
      li: {
        marginVertical: VS(2),
        color: HeadingColor,
        fontFamily: 'Helvetica',
      },
      a: {
        color: '#4da6ff',
        textDecorationLine: 'underline',
        fontFamily: 'Helvetica',
      },
    };

    const imageGallery =
      images.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: VS(8) }}
          contentContainerStyle={{ gap: 10 }}
        >
          {images.map((imgSrc, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => setPreviewImage(imgSrc)}
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
        contentWidth={width - 80}
        source={{ html: textWithoutImages }}
        baseStyle={{ color: HeadingColor, fontSize: MS(14) }}
        tagsStyles={tagsStyles}
        enableExperimentalBRCollapsing={true}
        ignoredDomTags={['script', 'style', 'head', 'meta', 'link']}
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
        {/* Bot icon */}
        {/* {!isUser && (
          <View style={styles.botIconContainer}>
            <Image source={StarsIcon} style={styles.botIcon} />
          </View>
        )} */}

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
                {isHtml ? (
                  <ScrollView
                    horizontal={hasTable}
                    showsHorizontalScrollIndicator={hasTable}
                    nestedScrollEnabled={true}
                  >
                    {htmlContent}
                  </ScrollView>
                ) : (
                  textWithoutImages && (
                    <Text
                      style={[
                        styles.messageText,
                        isUser && styles.messageTextUser,
                      ]}
                    >
                      {textWithoutImages}
                    </Text>
                  )
                )}
              </>
            )}
          </View>

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
                  // setSelectedMessageForFeedback(item);
                  setFeedbackModalVisible(true);
                }}
              >
                <Image source={ThumbIcon} style={styles.copyIcon} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation?.openDrawer?.() || navigation?.goBack?.()}
        >
          <Image source={MenuIcon} style={styles.headerIcon} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity activeOpacity={0.7}>
          {/* <View style={styles.chatIconContainer}>
            <Image source={StarsIcon} style={styles.chatIconText} />
          </View> */}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>ASK Finnan</Text>
              <Image source={StarsIcon} style={styles.titleIcon} />
            </View>
            <Text style={styles.subtitle}>
              The Global Football Master Agent. Powered by AI.{'\n'}Informed by
              Data.
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
        }
      />

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask Anything from Finnan"
          placeholderTextColor={SubHeadingColor}
          value={input}
          onChangeText={setInput}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={PrimaryColor} size="small" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
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
              style={[
                styles.previewImage,
                { width: width - S(40), height: height * 0.7 },
              ]}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setPreviewImage(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </Pressable>
      </Modal>

      {/* Feedback Modal */}
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
                imageSize={45}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PrimaryColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S(16),
    paddingVertical: VS(12),
    backgroundColor: PrimaryColor,
  },
  headerIcon: {
    width: S(24),
    height: VS(24),
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  chatIconContainer: {
    width: S(36),
    height: VS(36),
    borderRadius: MS(18),
    borderWidth: 1,
    borderColor: BorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIconText: {
    fontSize: MS(16),
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
  newConversationButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: BorderColor,
    borderRadius: MS(20),
    paddingHorizontal: S(16),
    paddingVertical: VS(10),
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
  messageRow: {
    flexDirection: 'row',
    marginVertical: VS(8),
    alignItems: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  botIconContainer: {
    width: S(36),
    height: VS(36),
    borderRadius: MS(18),
    borderWidth: 1,
    borderColor: BorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: S(10),
  },
  botIcon: {
    width: S(18),
    height: VS(18),
    tintColor: HeadingColor,
    resizeMode: 'contain',
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
    backgroundColor: BotBubbleColor,
    borderTopLeftRadius: MS(4),
  },
  bubbleUser: {
    backgroundColor: UserBubbleColor,
    borderTopRightRadius: MS(4),
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: MS(14),
    color: HeadingColor,
    lineHeight: 20,
    fontFamily: 'Helvetica',
  },
  messageTextUser: {
    color: HeadingColor,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MS(8),
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
  copyIcon: {
    width: S(18),
    height: VS(18),
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: VS(6),
    alignSelf: 'flex-start',
  },
  actionButton: {
    paddingVertical: VS(4),
    paddingHorizontal: S(8),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S(16),
    paddingVertical: VS(12),
    backgroundColor: PrimaryColor,
    borderTopWidth: 1,
    borderTopColor: BorderColor,
  },
  input: {
    flex: 1,
    minHeight: VS(44),
    maxHeight: VS(100),
    paddingHorizontal: S(16),
    paddingVertical: VS(10),
    backgroundColor: InputBgColor,
    borderRadius: MS(24),
    color: HeadingColor,
    fontSize: MS(14),
    fontFamily: 'Helvetica',
  },
  sendButton: {
    width: MS(44),
    height: MS(44),
    borderRadius: MS(22),
    backgroundColor: SecondaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: S(10),
  },
  sendIcon: {
    fontSize: MS(20),
    color: PrimaryColor,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    borderRadius: MS(12),
  },
  closeButton: {
    position: 'absolute',
    top: VS(50),
    right: S(20),
    width: S(40),
    height: VS(40),
    borderRadius: MS(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: HeadingColor,
    fontSize: MS(20),
    fontFamily: 'Helvetica-Bold',
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
