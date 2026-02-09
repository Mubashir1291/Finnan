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
import { StarsIcon, MenuIcon, CopyIcon } from '../../assets/Index';
import { CHAT, SESSION_AI } from '../../services/AppServices';
import { AI_CHATTING, userSession } from '../../services/config';
import { store } from '../../redux/store';

const initialMessages = [
  {
    id: '1',
    role: 'bot',
    text: "Hi! I'm Jose AIA, your football agent. Ready to explore transfers and stats?",
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
          handleSend(prompt);
        }, 500);
      }
    };

    initChat();
  }, [prompt]);

  const CreateSession = async () => {
    const obj = {
      platform_id: 'interdiscvr',
      agent_id: 'ea6da159-7ecf-4e5b-a5bf-97b2990cc33c',
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

  useEffect(() => {
    CreateSession();
  }, []);

  useEffect(() => {
    if (listRef.current && messages.length) {
      setTimeout(() => listRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = (text = null) => {
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
        agent_id: 'ea6da159-7ecf-4e5b-a5bf-97b2990cc33c',
        session_id: session,
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
        fontSize: 14,
      },
      p: {
        marginVertical: 4,
        color: HeadingColor,
        lineHeight: 22,
        fontSize: 14,
      },
      b: { fontWeight: 'bold', color: HeadingColor },
      strong: { fontWeight: 'bold', color: HeadingColor },
      h1: {
        fontSize: 20,
        fontWeight: 'bold',
        color: HeadingColor,
        marginVertical: 8,
      },
      h2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: HeadingColor,
        marginVertical: 6,
      },
      h3: {
        fontSize: 16,
        fontWeight: 'bold',
        color: HeadingColor,
        marginVertical: 4,
      },
      h4: {
        fontSize: 15,
        fontWeight: 'bold',
        color: HeadingColor,
        marginVertical: 4,
      },
      table: { marginVertical: 12, width: '100%' },
      tr: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
      },
      th: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        fontWeight: 'bold',
        fontSize: 13,
        color: HeadingColor,
        minWidth: 80,
      },
      td: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        fontSize: 13,
        color: SubHeadingColor,
        minWidth: 80,
      },
      ul: { marginVertical: 4, paddingLeft: 16 },
      li: { marginVertical: 2, color: HeadingColor },
      a: { color: '#4da6ff', textDecorationLine: 'underline' },
    };

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
        baseStyle={{ color: HeadingColor, fontSize: 14 }}
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
            <TouchableOpacity
              style={styles.copyButton}
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
              {/* <Text style={styles.copyButtonText}>Copy</Text> */}
              <Image source={CopyIcon} style={styles.copyIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
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
              <Text style={styles.mainTitle}>ASK JOSE AIA</Text>
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
          placeholder="Ask Anything from Jose"
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
                { width: width - 40, height: height * 0.7 },
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PrimaryColor,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  chatIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIconText: {
    fontSize: 16,
  },
  headerSection: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HeadingColor,
    letterSpacing: 1,
  },
  titleIcon: {
    width: 24,
    height: 24,
    tintColor: SecondaryColor,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 14,
    color: SubHeadingColor,
    lineHeight: 20,
    marginBottom: 16,
  },
  newConversationButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: BorderColor,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  newConversationText: {
    color: HeadingColor,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  botIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  botIcon: {
    width: 18,
    height: 18,
    tintColor: HeadingColor,
    resizeMode: 'contain',
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
    backgroundColor: BotBubbleColor,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: UserBubbleColor,
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    color: HeadingColor,
    lineHeight: 20,
  },
  messageTextUser: {
    color: HeadingColor,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    color: SubHeadingColor,
    fontSize: 14,
  },
  galleryImage: {
    width: 180,
    height: 140,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  copyIcon: {
    width: 18,
    height: 18,
    tintColor: HeadingColor,
    resizeMode: 'contain',
  },
  copyButton: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  copyButtonText: {
    color: SubHeadingColor,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PrimaryColor,
    borderTopWidth: 1,
    borderTopColor: BorderColor,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: InputBgColor,
    borderRadius: 24,
    color: HeadingColor,
    fontSize: 14,
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    borderRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: HeadingColor,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
