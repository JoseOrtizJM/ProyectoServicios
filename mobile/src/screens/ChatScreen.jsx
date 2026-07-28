import { Send } from "lucide-react-native";
import { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { sendChatMessage } from "../api/chatbot";
import { extractErrorMessages } from "../api/errors";
import { useTheme } from "../context/ThemeContext";

// Claude suele responder con **negritas** en markdown — esto las convierte
// a texto en negrita sin necesitar una librería completa de markdown.
function renderMessageContent(content, textColor) {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <Text key={index} style={{ fontWeight: "700", color: textColor }}>
        {part.slice(2, -2)}
      </Text>
    ) : (
      <Text key={index} style={{ color: textColor }}>
        {part}
      </Text>
    ),
  );
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const previousMessages = messages;
    setError("");
    setInput("");
    setMessages([...previousMessages, { role: "user", content: trimmed }]);
    setSending(true);

    try {
      const data = await sendChatMessage(trimmed, previousMessages);
      setMessages(data.history);
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
      setMessages(previousMessages);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>
            Pregúntame sobre el catálogo: producto más vendido, mejor valorado, más barato…
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            const bgColor = isUser ? colors.primary : colors.surfaceMuted;
            const textColor = isUser ? colors.primaryForeground : colors.foreground;
            return (
              <View
                style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant, { backgroundColor: bgColor }]}
              >
                <Text style={{ fontSize: 14 }}>{renderMessageContent(item.content, textColor)}</Text>
              </View>
            );
          }}
        />
      )}

      {sending && (
        <View
          style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: colors.surfaceMuted, marginHorizontal: 16 }]}
        >
          <Text style={{ color: colors.muted, fontSize: 13 }}>Escribiendo…</Text>
        </View>
      )}

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu pregunta…"
          placeholderTextColor={colors.muted}
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
        />
        <Pressable
          onPress={handleSend}
          disabled={sending || !input.trim()}
          style={[styles.sendButton, { backgroundColor: colors.primary, opacity: sending || !input.trim() ? 0.5 : 1 }]}
        >
          <Send size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 16, gap: 8 },
  bubble: { maxWidth: "82%", borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12 },
  bubbleUser: { alignSelf: "flex-end" },
  bubbleAssistant: { alignSelf: "flex-start" },
  error: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 4 },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, alignItems: "center" },
  input: { flex: 1, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sendButton: { width: 40, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center" },
});
