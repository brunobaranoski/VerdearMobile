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
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TelaChat() {
const chats = [
  {
    id: "1",
    name: "Fulano",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
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
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    lastMessage: "Pode me ajudar?",
    messages: [
      { from: "bot", text: "Olá Ciclano!" },
      { from: "user", text: "Pode me ajudar?" },
      { from: "bot", text: "Claro, diga sua dúvida!" },
      { from: "user", text: "Não recebi meu produto." },
      {
        from: "bot",
        text: "Pode por favor me informar o código do seu pedido?",
      },
      { from: "user", text: "989706" },
      { from: "bot", text: "Só um momento por favor que estou verificando" },
    ],
  },
  {
    id: "3",
    name: "Maria",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    lastMessage: "Tudo certo com meu pedido?",
    messages: [
      { from: "bot", text: "Olá Maria!" },
      { from: "user", text: "Tudo certo com meu pedido?" },
      { from: "bot", text: "Sim, ele já foi enviado. Deve chegar amanhã." },
    ],
  },
  {
    id: "4",
    name: "Joana",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    lastMessage: "Obrigada!",
    messages: [
      { from: "bot", text: "Olá Joana!" },
      { from: "user", text: "Obrigada!" },
      { from: "bot", text: "De nada 😊" },
    ],
  },
];

  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");

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
    Keyboard.dismiss();
  };

  // ------------------------------------
  // LISTA DE CONVERSAS
  // ------------------------------------
  if (!selected) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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

  // ------------------------------------
  // TELA DE CHAT ABERTA
  // ------------------------------------
  return (
    <View style={styles.chatContainer}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      {/* Fundo dividido */}
      <View style={styles.backgroundLayer}>
        <View style={styles.topGreenHalf} />
        <View style={styles.bottomWhiteHalf} />
      </View>

      {/* Conteúdo */}
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
>
  <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
            showsVerticalScrollIndicator={false}
          />

          {/* Campo de envio */}
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={22} color="#6e6e6e" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Envie sua mensagem"
              placeholderTextColor="#6e6e6e"
              value={inputMessage}
              onChangeText={setInputMessage}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="arrow-forward" size={22} color="#1B5E20" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ------------------------------------
// ESTILOS
// ------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  chatContainer: {
    flex: 1,
    backgroundColor: "#1B5E20", // Corrige o topo branco
  },

  // Fundo dividido
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGreenHalf: {
    flex: 0.5,
    backgroundColor: "#1B5E20",
  },
  bottomWhiteHalf: {
    flex: 0.5,
    backgroundColor: "#fff",
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
  chatHeaderTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },

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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  emojiButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f8f8f8",
    borderRadius: 20,
    fontSize: 15,
    color: "#333",
  },
  sendButton: {
    marginLeft: 8,
  },
});
