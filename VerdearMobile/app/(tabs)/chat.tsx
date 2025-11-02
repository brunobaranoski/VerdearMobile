// app/tabs/TelaChat.tsx
// ✅ Versão TypeScript corrigida, funcional e com login automático temporário (admin@gmail.com / greener)

import React, { useEffect, useRef, useState } from "react";
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
  ActivityIndicator,
  Modal,
  Alert,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

// ======================
// 🔰 Tipos TypeScript
// ======================
type Message = {
  id?: string;
  from: string;
  text: string;
  createdAt?: Date | null;
  type?: string;
};

type Chat = {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastUpdated?: Date | null;
  title?: string | null;
  avatar?: string | null;
};

// ======================
// 🚀 Componente principal
// ======================
export default function TelaChat() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<Chat | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [inputMessage, setInputMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newInitialMessage, setNewInitialMessage] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  const unsubChatsRef = useRef<any>(null);
  const unsubMessagesRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // --- login automático temporário ---
  const TEST_EMAIL = "admin@gmail.com";
  const TEST_PASS = "greener";

  // ===================================
  // 🔐 Autenticação
  // ===================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        // garante users/{uid}
        try {
          const userRef = doc(db, "users", u.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              email: u.email || "",
              name: u.displayName || u.email?.split("@")[0] || "Usuário",
              avatar:
                u.photoURL ||
                `https://i.pravatar.cc/150?u=${encodeURIComponent(u.email ?? "")}`,
              createdAt: new Date().toISOString(),
            });
            console.log("[users] doc criado automático para", u.uid);
          }
        } catch (err) {
          console.error("Erro garantindo users doc:", err);
        }
      } else {
        // login automático
        try {
          console.log("[autologin] tentando login automático...");
          await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASS);
        } catch (err) {
          console.warn("[autologin] falhou:", (err as any).message);
        }
      }
    });
    return () => unsub();
  }, []);

  // ===================================
  // 💬 Lista de conversas
  // ===================================
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoadingChats(false);
      return;
    }

    setLoadingChats(true);

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdated", "desc")
    );

    if (unsubChatsRef.current) unsubChatsRef.current();
    unsubChatsRef.current = onSnapshot(
      q,
      (snapshot) => {
        const arr: Chat[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Chat),
        }));
        setChats(arr);
        setLoadingChats(false);
      },
      (err) => {
        console.error("Erro ao carregar chats:", err);
        setLoadingChats(false);
      }
    );

    return () => {
      if (unsubChatsRef.current) unsubChatsRef.current();
    };
  }, [user]);

  // ===================================
  // 📨 Mensagens em tempo real
  // ===================================
  useEffect(() => {
    if (!selectedChatId) {
      if (unsubMessagesRef.current) unsubMessagesRef.current();
      setMessages([]);
      setSelectedMeta(null);
      return;
    }

    setLoadingMessages(true);

    const meta = chats.find((c) => c.id === selectedChatId) || null;
    setSelectedMeta(meta);

    const messagesCol = collection(db, "chats", selectedChatId, "messages");
    const q = query(messagesCol, orderBy("createdAt", "asc"));

    if (unsubMessagesRef.current) unsubMessagesRef.current();
    unsubMessagesRef.current = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            from: data.from,
            text: data.text,
            createdAt: data.createdAt ? data.createdAt.toDate() : null,
            type: data.type || "text",
          };
        });
        setMessages(msgs);
        setLoadingMessages(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
      },
      (err) => {
        console.error("Erro ao carregar mensagens:", err);
        setLoadingMessages(false);
      }
    );

    return () => {
      if (unsubMessagesRef.current) unsubMessagesRef.current();
    };
  }, [selectedChatId, chats]);

  // ===================================
  // ✉️ Enviar mensagem
  // ===================================
  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    if (!user || !selectedChatId) {
      Alert.alert("Erro", "Selecione uma conversa e faça login.");
      return;
    }

    try {
      const chatRef = doc(db, "chats", selectedChatId);
      const messagesCol = collection(chatRef, "messages");

      await addDoc(messagesCol, {
        from: user.uid,
        text: inputMessage.trim(),
        createdAt: serverTimestamp(),
        type: "text",
      });

      await updateDoc(chatRef, {
        lastMessage: inputMessage.trim(),
        lastUpdated: serverTimestamp(),
      });

      setInputMessage("");
      Keyboard.dismiss();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    }
  };

  // ===================================
  // 🆕 Criar nova conversa
  // ===================================
  const handleCreateChat = async () => {
    try {
      console.log("[createChat] iniciando...", { newEmail, newInitialMessage });
      if (!newEmail || !newEmail.trim()) {
        Alert.alert("Atenção", "Digite um e-mail válido para o destinatário.");
        return;
      }
      if (!user) {
        Alert.alert("Atenção", "Você precisa estar logado para criar uma conversa.");
        return;
      }

      setCreatingChat(true);
      const emailNormalized = newEmail.trim().toLowerCase();

      // buscar user por email
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("email", "==", emailNormalized));
      const usersSnap = await getDocs(usersQuery);

      if (usersSnap.empty) {
        console.log("[createChat] usuário não encontrado:", emailNormalized);
        Alert.alert(
          "Usuário não encontrado",
          "O usuário com esse e-mail não está cadastrado. Peça para ele se cadastrar."
        );
        setCreatingChat(false);
        return;
      }

      const otherDoc = usersSnap.docs[0];
      const otherUid = otherDoc.id;
      const otherData = otherDoc.data();

      // checar chat existente
      const existing = chats.find(
        (c) =>
          c.participants &&
          c.participants.includes(user.uid) &&
          c.participants.includes(otherUid)
      );
      if (existing) {
        Alert.alert("Já existe", "Uma conversa com esse usuário já existe.");
        setModalVisible(false);
        setCreatingChat(false);
        setSelectedChatId(existing.id);
        return;
      }

      // criar novo chat
      const firstText = newInitialMessage.trim() || "Olá!";
      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [user.uid, otherUid],
        lastMessage: firstText,
        lastUpdated: serverTimestamp(),
        title: otherData?.name || otherData?.email || "Contato",
        avatar: otherData?.avatar || null,
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        from: user.uid,
        text: firstText,
        createdAt: serverTimestamp(),
        type: "text",
      });

      // força aparecer na lista local
      setChats((prev) => [
        {
          id: chatRef.id,
          participants: [user.uid, otherUid],
          lastMessage: firstText,
          lastUpdated: new Date(),
          title: otherData?.name || otherData?.email || "Contato",
          avatar: otherData?.avatar || null,
        },
        ...prev,
      ]);

      setModalVisible(false);
      setNewEmail("");
      setNewInitialMessage("");
      setSelectedChatId(chatRef.id);
      setCreatingChat(false);
      Alert.alert("Conversa criada", "Conversa criada com sucesso!");
    } catch (error) {
      console.error("[createChat] erro:", error);
      Alert.alert("Erro", "Falha ao criar conversa. Verifique o console.");
      setCreatingChat(false);
    }
  };

  // ===================================
  // 🧩 Renders
  // ===================================
  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => setSelectedChatId(item.id)}>
      <Image
        source={{ uri: item.avatar || `https://i.pravatar.cc/150?u=${item.id}` }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.chatName}>{item.title}</Text>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.message, item.from === user?.uid ? styles.user : styles.bot]}>
      <Text
        style={[
          styles.messageText,
          item.from === user?.uid ? { color: "#fff" } : { color: "#000" },
        ]}
      >
        {item.text}
      </Text>
      {item.createdAt && (
        <Text style={styles.timestamp}>
          {item.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}
    </View>
  );

  // ===================================
  // 📱 Tela de Lista
  // ===================================
  if (!selectedChatId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
        <View style={styles.listHeader}>
          <Ionicons name="chatbubbles-outline" size={24} color="#1B5E20" />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={styles.headerTitle}>Conversas</Text>
            <Text style={styles.headerSubtitle}>Toque para abrir ou criar nova conversa</Text>
          </View>

          <TouchableOpacity style={styles.newChatButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color="#1B5E20" />
          </TouchableOpacity>
        </View>

        {loadingChats ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#1B5E20" />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}

        {/* Modal criar conversa */}
        <Modal animationType="slide" visible={modalVisible} transparent>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.modal}>
              <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
                Nova conversa
              </Text>
              <TextInput
                placeholder="Email do destinatário"
                value={newEmail}
                onChangeText={setNewEmail}
                style={modalStyles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Mensagem inicial (opcional)"
                value={newInitialMessage}
                onChangeText={setNewInitialMessage}
                style={[modalStyles.input, { height: 80 }]}
                multiline
              />

              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setNewEmail("");
                    setNewInitialMessage("");
                  }}
                >
                  <Text style={{ marginRight: 16, color: "#666" }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCreateChat} disabled={creatingChat}>
                  <Text style={{ color: "#1B5E20", fontWeight: "600" }}>
                    {creatingChat ? "Criando..." : "Criar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ===================================
  // 🧾 Tela de Chat Aberto
  // ===================================
  const meta = chats.find((c) => c.id === selectedChatId) || selectedMeta || {};
  const chatTitle = meta.title || "Conversa";

  return (
    <View style={styles.chatContainer}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedChatId(null)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{
                uri: meta.avatar || `https://i.pravatar.cc/150?u=${meta.id || "anon"}`,
              }}
              style={styles.headerAvatar}
            />
            <Text style={styles.chatHeaderTitle}>{chatTitle}</Text>
          </View>

          {loadingMessages ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#1B5E20" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id || Math.random().toString()}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={styles.inputContainer}>
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

// ======================
// 💅 Estilos
// ======================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatContainer: { flex: 1, backgroundColor: "#1B5E20" },
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
  newChatButton: { padding: 4 },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  avatar: { width: 45, height: 45, borderRadius: 25, marginRight: 10 },
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
  messagesContainer: { padding: 10, flexGrow: 1, backgroundColor: "#fff" },
  message: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
  },
  bot: { backgroundColor: "#EAE7E1", alignSelf: "flex-start" },
  user: { backgroundColor: "#1B5E20", alignSelf: "flex-end" },
  messageText: { fontSize: 15 },
  timestamp: { fontSize: 10, color: "#666", marginTop: 4, alignSelf: "flex-end" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
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
  sendButton: { marginLeft: 8 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginTop: 8,
  },
});
