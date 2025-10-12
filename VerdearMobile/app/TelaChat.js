import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TelaChat() {
  // Lista simulada
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
      ],
    },
    {
      id: "3",
      name: "Beltrano",
      avatar: "https://placehold.co/100x100",
      lastMessage: "Tem desconto?",
      messages: [
        { from: "bot", text: "Olá Beltrano!" },
        { from: "user", text: "Tem desconto?" },
        { from: "bot", text: "Depende do produto 😄" },
      ],
    },
  ];

  const [selectedChat, setSelectedChat] = useState(null);
  const [inputMessage, setInputMessage] = useState("");

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.message,
        item.from === "user" ? styles.user : styles.bot,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  // Objeto do chat selecionado
  const selected = chats.find((c) => c.id === selectedChat);

  // Função para enviar mensagem
  const handleSend = () => {
    if (!inputMessage.trim()) return;
    selected.messages.push({ from: "user", text: inputMessage });
    setInputMessage("");
  };

  // -----------------------------
  // Tela 1: Lista de conversas
  // -----------------------------
  if (!selected) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  // -----------------------------
  // Tela 2: Conversa do chat
  // -----------------------------
  return (
    <View style={styles.container}>
      {/* Cabeçalho do chat */}
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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Envie sua mensagem"
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity onPress={handleSend}>
          <Ionicons name="send" size={22} color="#1B5E20" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -----------------------------
// Estilos
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ---- Lista de chats ----
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#F8F8F8",
  },
  headerTitle: { fontSize: 16, color: "#1B5E20", fontWeight: "600" },
  headerSubtitle: { fontSize: 12, color: "#777" },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  chatName: { fontWeight: "bold", color: "#333" },
  chatPreview: { color: "#888", fontSize: 12 },

  // ---- Chat ----
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
  messagesContainer: { padding: 10, flexGrow: 1 },

  message: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  bot: { backgroundColor: "#EAE7E1", alignSelf: "flex-start" },
  user: { backgroundColor: "#1B5E20", alignSelf: "flex-end" },
  messageText: { color: "#000" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: { flex: 1, padding: 10, fontSize: 16 },
});