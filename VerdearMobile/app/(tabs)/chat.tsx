import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TelaChat() {
  const chats = [
    {
      id: "1",
      name: "Fulano",
      avatar: "https://placehold.co/100x100",
      lastMessage: "Oi! Tudo bem?",
      messages: [
        { from: "bot", text: "Olá Fulano!" },
        { from: "user", text: "Oi! Tudo bem?" },
        { from: "bot", text: "Como posso te ajudar hoje?" },
      ],
    },
    {
      id: "2",
      name: "Ciclano",
      avatar: "https://placehold.co/100x100",
      lastMessage: "Pode me ajudar?",
      messages: [
        { from: "bot", text: "Olá Ciclano!" },
        { from: "user", text: "Pode me ajudar?" },
        { from: "bot", text: "Claro, diga sua dúvida!" },
        { from: "user", text: "Não recebi meu produto." },
        { from: "bot", text: "Pode por favor me informar o código do seu pedido?" },
        { from: "user", text: "989706" },
        { from: "bot", text: "Só um momento por favor que estou verificando" },
      ],
    },
  ];

  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const insets = useSafeAreaInsets();

  const selected = chats.find((c) => c.id === selectedChat);

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.message,
        item.from === "user" ? styles.user : styles.bot,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.from === "user" ? { color: "#fff" } : { color: "#000" },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    selected.messages.push({ from: "user", text: inputMessage });
    setInputMessage("");
  };

  // -----------------------------
  // Lista de conversas
  // -----------------------------
  if (!selected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
        <View style={styles.listHeader}>
          <Ionicons name="help-circle-outline" size={24} color="#1B5E20" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.headerTitle}>Perguntas Frequentes</Text>
            <Text style={styles.headerSubtitle}>Está com dúvidas?</Text>
          </View>
        </View>

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => setSelectedChat(item.id)}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.chatName}>{item.name}</Text>
                <Text style={styles.chatPreview}>{item.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // -----------------------------
  // Chat aberto
  // -----------------------------
  return (
    <SafeAreaView style={styles.chatSafeArea}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* Cabeçalho */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedChat(null)}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: selected.avatar }} style={styles.headerAvatar} />
          <Text style={styles.chatHeaderTitle}>{selected.name}</Text>
        </View>

        {/* Mensagens */}
        <FlatList
          data={selected.messages}
          renderItem={renderMessage}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
        />

        {/* Campo de envio */}
        <View
          style={[
            styles.inputContainer,
            {
              paddingBottom: 0, // usa apenas o safe area real
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => console.log("Emoji button pressed")}
            style={styles.emojiButton}
          >
            <Ionicons name="happy-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Envie sua mensagem"
            placeholderTextColor="#888"
            value={inputMessage}
            onChangeText={setInputMessage}
          />

          <TouchableOpacity onPress={handleSend}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -----------------------------
// ESTILOS
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },

  chatSafeArea: {
    flex: 1,
    backgroundColor: "#1B5E20",
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#F8F8F8",
  },
  headerTitle: { fontSize: 18, color: "#1B5E20", fontWeight: "600" },
  headerSubtitle: { fontSize: 12, color: "#777" },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  chatName: { fontWeight: "bold", color: "#333" },
  chatPreview: { color: "#888", fontSize: 12 },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B5E20",
    padding: 12,
    gap: 10,
  },
  headerAvatar: { width: 35, height: 35, borderRadius: 20 },
  chatHeaderTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
    backgroundColor: "#fff",
  },

  message: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  bot: { backgroundColor: "#EAE7E1", alignSelf: "flex-start" },
  user: { backgroundColor: "#1B5E20", alignSelf: "flex-end" },
  messageText: { fontSize: 15 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B5E20",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  emojiButton: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
  },
});
