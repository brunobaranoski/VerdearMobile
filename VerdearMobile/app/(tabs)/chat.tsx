

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
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Toast } from "../../components/shared/Index";

import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

// Tipos typeScript
type Message = {
  id: string;
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
  titles?: { [uid: string]: string };
  avatars?: { [uid: string]: string | null };
};


// Componente principal
export default function TelaChat() {
  const { user } = useAuth();
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

  // Estados do Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");

  const unsubChatsRef = useRef<null | (() => void)>(null);
  const unsubMessagesRef = useRef<null | (() => void)>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Função helper para mostrar Toast
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };


  // Lista de conversas
  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoadingChats(false);
      return;
    }

    setLoadingChats(true);

    const qChats = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdated", "desc")
    );

    if (unsubChatsRef.current) unsubChatsRef.current();

    unsubChatsRef.current = onSnapshot(
      qChats,
      (snapshot) => {
        try {
          const arr: Chat[] = snapshot.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              participants: data.participants || [],
              lastMessage: data.lastMessage || "",
              lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null,
              titles: data.titles || {},
              avatars: data.avatars || {},
            };
          });
          setChats(arr);
          setLoadingChats(false);
        } catch (err) {
          console.error("Erro ao processar chats:", err);
          setLoadingChats(false);
          showToast("Não foi possível carregar as conversas.", "error");
        }
      },
      (err) => {
        console.error("Erro ao carregar chats:", err);
        setLoadingChats(false);
        showToast("Não foi possível carregar as conversas.", "error");
      }
    );

    return () => {
      if (unsubChatsRef.current) unsubChatsRef.current();
    };
  }, [user]);

  // Mensagens em tempo real
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
    const qMessages = query(messagesCol, orderBy("createdAt", "asc"));

    if (unsubMessagesRef.current) unsubMessagesRef.current();

    unsubMessagesRef.current = onSnapshot(
      qMessages,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
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
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          120
        );
      },
      (err) => {
        console.error("Erro ao carregar mensagens:", err);
        setLoadingMessages(false);
        showToast("Não foi possível carregar as mensagens.", "error");
      }
    );

    return () => {
      if (unsubMessagesRef.current) unsubMessagesRef.current();
    };
  }, [selectedChatId, chats]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    if (!user || !selectedChatId) {
      showToast("Selecione uma conversa e faça login.", "error");
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
      showToast("Não foi possível enviar a mensagem.", "error");
    }
  };

  // Apagar / encerrar conversa
  const handleDeleteChat = async () => {
    if (!selectedChatId) return;

    try {
      const chatRef = doc(db, "chats", selectedChatId);
      const messagesCol = collection(chatRef, "messages");
      const messagesSnap = await getDocs(messagesCol);

      const deletions = messagesSnap.docs.map((m) => deleteDoc(m.ref));
      await Promise.all(deletions);

      await deleteDoc(chatRef);

      showToast("Conversa encerrada com sucesso.", "success");
      setSelectedChatId(null);
    } catch (err: any) {
      console.error("Erro ao apagar conversa:", err);
      showToast("Não foi possível encerrar a conversa.", "error");
    }
  };

  const confirmDeleteChat = () => {
    if (!selectedChatId) return;

    // Tratamento especial para web
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Deseja realmente apagar esta conversa? Isso irá remover todas as mensagens."
      );
      if (confirmed) {
        handleDeleteChat();
      }
      return;
    }

    // Mobile usa alert nativo
    Alert.alert(
      "Encerrar conversa",
      "Deseja realmente apagar esta conversa? Isso irá remover todas as mensagens.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Encerrar",
          style: "destructive",
          onPress: handleDeleteChat,
        },
      ]
    );
  };

  // Criar nova conversa
  const handleCreateChat = async () => {
    try {
      console.log("[createChat] iniciando...", { newEmail, newInitialMessage });
      if (!newEmail || !newEmail.trim()) {
        showToast("Digite um e-mail válido para o destinatário.", "warning");
        return;
      }
      if (!user) {
        showToast(
          "Você precisa estar logado para criar uma conversa.",
          "warning"
        );
        return;
      }

      setCreatingChat(true);
      const emailNormalized = newEmail.trim().toLowerCase();

      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("email", "==", emailNormalized));
      const usersSnap = await getDocs(usersQuery);

      if (usersSnap.empty) {
        console.log("[createChat] usuário não encontrado:", emailNormalized);
        showToast(
          "O usuário com esse e-mail não está cadastrado. Peça para ele se cadastrar.",
          "error"
        );
        setCreatingChat(false);
        return;
      }

      const otherDoc = usersSnap.docs[0];
      const otherUid = otherDoc.id;
      const otherData = otherDoc.data() as any;

      let meData: any = null;
      try {
        const meDoc = await getDoc(doc(db, "users", user.uid));
        if (meDoc.exists()) meData = meDoc.data();
      } catch (e) {
        console.warn(
          "[createChat] não foi possível ler dados do usuário atual",
          e
        );
      }

      const existing = chats.find(
        (c) =>
          c.participants &&
          c.participants.includes(user.uid) &&
          c.participants.includes(otherUid)
      );
      if (existing) {
        showToast("Uma conversa com esse usuário já existe.", "info");
        setModalVisible(false);
        setCreatingChat(false);
        setSelectedChatId(existing.id);
        return;
      }

      const titles: { [uid: string]: string } = {
        [user.uid]:
          otherData?.name || otherData?.email || "Contato",
        [otherUid]:
          meData?.name || meData?.email || user.email || "Contato",
      };

      const avatars: { [uid: string]: string | null } = {
        [user.uid]: otherData?.avatar || null,
        [otherUid]: meData?.avatar || null,
      };

      const firstText = newInitialMessage.trim() || "Olá!";
      const chatRef = await addDoc(collection(db, "chats"), {
        participants: [user.uid, otherUid],
        lastMessage: firstText,
        lastUpdated: serverTimestamp(),
        titles,
        avatars,
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        from: user.uid,
        text: firstText,
        createdAt: serverTimestamp(),
        type: "text",
      });

      setModalVisible(false);
      setNewEmail("");
      setNewInitialMessage("");
      setSelectedChatId(chatRef.id);
      setCreatingChat(false);
      showToast("Conversa criada com sucesso!", "success");
    } catch (error) {
      console.error("[createChat] erro:", error);
      showToast("Falha ao criar conversa. Verifique o console.", "error");
      setCreatingChat(false);
    }
  };

  // Renders
  const getChatTitleForUser = (chat: Chat): string => {
    if (!user) return "Conversa";
    return chat.titles?.[user.uid] || "Conversa";
  };

  const getChatAvatarForUser = (chat: Chat): string | undefined => {
    if (!user) return undefined;
    return chat.avatars?.[user.uid] || undefined;
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const title = getChatTitleForUser(item);
    const avatarUri =
      getChatAvatarForUser(item) || `https://i.pravatar.cc/150?u=${item.id}`;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => setSelectedChatId(item.id)}
      >
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chatName}>{title}</Text>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.from === user?.uid ? styles.user : styles.bot,
      ]}
    >
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
          {item.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    </View>
  );

  // Tela de Lista
  if (!selectedChatId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
        <View style={styles.listHeader}>
          <Ionicons name="chatbubbles-outline" size={24} color="#1B5E20" />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={styles.headerTitle}>Conversas</Text>
            <Text style={styles.headerSubtitle}>
              Toque para abrir ou criar nova conversa
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={28} color="#1B5E20" />
          </TouchableOpacity>
        </View>

        {loadingChats ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
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
              <Text
                style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}
              >
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

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setNewEmail("");
                    setNewInitialMessage("");
                  }}
                >
                  <Text style={{ marginRight: 16, color: "#666" }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateChat}
                  disabled={creatingChat}
                >
                  <Text style={{ color: "#1B5E20", fontWeight: "600" }}>
                    {creatingChat ? "Criando..." : "Criar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Toast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // Tela de chat aberto
  const meta =
    chats.find((c) => c.id === selectedChatId) || selectedMeta || null;

  const headerTitle = meta ? getChatTitleForUser(meta) : "Conversa";
  const headerAvatarUri =
    (meta && getChatAvatarForUser(meta)) ||
    `https://i.pravatar.cc/150?u=${meta?.id || "anon"}`;

  return (
    <View style={styles.chatContainer}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedChatId(null)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{ uri: headerAvatarUri }}
              style={styles.headerAvatar}
            />
            <Text style={styles.chatHeaderTitle}>{headerTitle}</Text>

            <TouchableOpacity
              onPress={confirmDeleteChat}
              style={{ marginLeft: "auto" }}
            >
              <Ionicons name="trash-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {loadingMessages ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#1B5E20" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
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

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

// Estilos
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
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
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
