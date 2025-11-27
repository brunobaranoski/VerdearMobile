// perfil.tsx
import PerfilComprador from "@/components/perfil/PerfilComprador";
import PerfilVendedor from "@/components/perfil/PerfilVendedor";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

// >>> IMPORT FIREBASE / FIRESTORE (igual ao chat.tsx) <<<
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

/*
  Mantém layout original. Painel Admin (modal) acessível por long-press no logo.
  Adicionado antes: botão "Excluir produto" para seleção múltipla.
  Agora: produtos passam a ser salvos no Firestore (coleção "products").
*/

/* ---------- Backend local APENAS para pedidos (orders) ---------- */
const KEY_ORDERS = "APP_ORDERS_V1";

const backend = {
  async _ensureOrders() {
    const raw = await AsyncStorage.getItem(KEY_ORDERS);
    if (!raw) {
      await AsyncStorage.setItem(KEY_ORDERS, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      await AsyncStorage.setItem(KEY_ORDERS, JSON.stringify([]));
      return [];
    }
  },

  async listOrders() {
    return (await this._ensureOrders()).slice();
  },

  async addOrder(order) {
    const arr = await this._ensureOrders();
    const id = "o-" + Date.now().toString(36);
    const o = { id, ...order, createdAt: new Date().toISOString(), status: "created" };
    arr.push(o);
    await AsyncStorage.setItem(KEY_ORDERS, JSON.stringify(arr));
    return o;
  },
};

/* ---------- Componente principal (layout original) ---------- */
export default function PerfilScreen() {
  const { userData, loading } = useAuth();
  const userType = userData?.userType || "Comprador";
  const sellerId = userData?.uid ?? null;

  // Admin modal state
  const [adminVisible, setAdminVisible] = useState(false);

  // Products + loading
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders + loading
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Add product form
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodImageDataUri, setProdImageDataUri] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageDataUri, setEditImageDataUri] = useState<string | null>(null);

  // Selection mode for bulk delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // array of ids

  useEffect(() => {
    // layout original: nada aqui
  }, []);

  /* ---------- PRODUCTS NO FIRESTORE ---------- */

  // load products from Firestore
  const loadProducts = async () => {
    if (!sellerId) {
      Alert.alert("Erro", "Usuário não identificado para carregar produtos.");
      setProducts([]);
      return;
    }

    setProductsLoading(true);
    try {
      const productsCol = collection(db, "products");

      // apenas produtos deste vendedor
      const qProducts = query(productsCol, where("sellerId", "==", sellerId));
      const snap = await getDocs(qProducts);

      const list = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name,
          price: data.price,
          description: data.description,
          stock: data.stock,
          image: data.image ?? null,
          sellerId: data.sellerId ?? null,
        };
      });

      setProducts(list);
    } catch (err) {
      console.error("Erro listar produtos Firestore", err);
      Alert.alert("Erro", "Não foi possível carregar o catálogo.");
    } finally {
      setProductsLoading(false);
    }
  };

  // add product -> Firestore
  const handleAddProduct = async () => {
    if (!sellerId) {
      Alert.alert("Erro", "Usuário não identificado para cadastrar produto.");
      return;
    }

    if (!prodName || prodName.trim().length < 2) {
      Alert.alert("Nome inválido", "Informe um nome com ao menos 2 caracteres.");
      return;
    }
    const priceNum = Number(prodPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Preço inválido", "Informe um preço válido (> 0).");
      return;
    }
    const stockNum = Number(prodStock);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert("Estoque inválido", "Informe um estoque válido (0 ou mais).");
      return;
    }

    try {
      setAddingProduct(true);

      const productsCol = collection(db, "products");

      await addDoc(productsCol, {
        name: prodName.trim(),
        price: priceNum,
        description: prodDesc.trim(),
        stock: stockNum,
        image: prodImageDataUri || null,
        sellerId,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", `Produto "${prodName.trim()}" cadastrado no Firebase.`);

      // limpar form
      setProdName("");
      setProdPrice("");
      setProdDesc("");
      setProdStock("");
      setProdImageDataUri(null);

      await loadProducts();
    } catch (err) {
      console.error("Erro add product Firestore", err);
      Alert.alert("Erro", "Não foi possível cadastrar o produto.");
    } finally {
      setAddingProduct(false);
    }
  };

  // open edit modal
  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditImageDataUri(product.image || null);
    setEditModalVisible(true);
  };

  // save edit -> Firestore
  const saveEditProduct = async () => {
    if (!editingProduct) return;
    if (!editName || editName.trim().length < 2) {
      Alert.alert("Nome inválido");
      return;
    }
    const priceNum = Number(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Preço inválido");
      return;
    }
    const stockNum = Number(editStock);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert("Estoque inválido");
      return;
    }

    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        name: editName.trim(),
        price: priceNum,
        stock: stockNum,
        image: editImageDataUri || null,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Produto atualizado no Firebase.");
      setEditModalVisible(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      console.error("Erro update product Firestore", err);
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
    }
  };

  // single delete with confirmation -> Firestore
  const handleDeleteProduct = async (id: string) => {
    Alert.alert("Confirmar exclusão", "Deseja realmente excluir este produto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const productRef = doc(db, "products", id);
            await deleteDoc(productRef);
            await loadProducts();
            Alert.alert("Removido", "Produto removido com sucesso do Firebase.");
          } catch (err) {
            console.error("Erro delete product Firestore", err);
            Alert.alert("Erro", "Não foi possível remover o produto.");
          }
        },
      },
    ]);
  };

  // toggle selection of a product
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  // clear selection mode
  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  // bulk delete selected items -> Firestore
  const deleteSelectedBulk = () => {
    if (!selectedIds.length) {
      Alert.alert("Nenhum produto selecionado", "Marque ao menos um produto para excluir.");
      return;
    }
    Alert.alert(
      "Excluir selecionados",
      `Tem certeza que deseja excluir ${selectedIds.length} produto(s)?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(
                selectedIds.map((id) => {
                  const productRef = doc(db, "products", id);
                  return deleteDoc(productRef);
                })
              );
              await loadProducts();
              cancelSelectionMode();
              Alert.alert("Removidos", "Produtos excluídos com sucesso do Firebase.");
            } catch (err) {
              console.error("Erro bulk delete Firestore", err);
              Alert.alert("Erro", "Não foi possível excluir os produtos.");
            }
          },
        },
      ]
    );
  };

  /* ---------- ORDERS (mantidos no AsyncStorage) ---------- */

  // load orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const list = await backend.listOrders();
      setOrders(list);
    } catch (err) {
      console.error("Erro listar pedidos", err);
      Alert.alert("Erro", "Não foi possível carregar pedidos.");
    } finally {
      setOrdersLoading(false);
    }
  };

  // pick image as base64 (mantido)
  const pickImageAsBase64 = async (onPicked: (uri: string) => void) => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão necessária", "Permita acesso à galeria para adicionar imagens.");
          return;
        }
      }
      const result: any = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.cancelled) {
        const mime = result.uri && result.uri.endsWith(".png") ? "image/png" : "image/jpeg";
        const dataUri = `data:${mime};base64,${result.base64}`;
        onPicked(dataUri);
      }
    } catch (err) {
      console.error("Erro ao selecionar imagem", err);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  /* ---------- render header (exatamente como antes) ---------- */
  const renderHeader = () => (
    <>
      <View style={styles.projectHeader}>
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={async () => {
            setAdminVisible(true);
            await loadProducts();
            await loadOrders();
          }}
        >
          <Image source={require("../../assets/images/logo_verdear.png")} style={styles.logo} />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#777" />
          <TextInput style={styles.searchInput} placeholderTextColor="#888" placeholder="Buscar..." />
        </View>
      </View>

      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Minha conta</Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {renderHeader()}

      {/* layout original preserved */}
      {userType === "Vendedor" ? <PerfilVendedor /> : <PerfilComprador />}

      {/* Admin Modal (oculto) */}
      <Modal
        visible={adminVisible}
        animationType="slide"
        onRequestClose={() => {
          setAdminVisible(false);
          cancelSelectionMode();
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={adminStyles.topBar}>
            <Text style={adminStyles.topTitle}>Painel Admin (produtos)</Text>
            <TouchableOpacity
              onPress={() => {
                setAdminVisible(false);
                cancelSelectionMode();
              }}
              style={{ padding: 10 }}
            >
              <Text style={{ color: "#c00" }}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={adminStyles.sectionTitle}>Catálogo de produtos</Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" }}>
              <TouchableOpacity style={[adminStyles.button, { marginRight: 8 }]} onPress={loadProducts}>
                <Text style={adminStyles.buttonText}>Recarregar catálogo</Text>
              </TouchableOpacity>

              {/* botão seleção múltipla */}
              <TouchableOpacity
                style={[
                  adminStyles.button,
                  selectionMode ? { backgroundColor: "#c00" } : { backgroundColor: "#38764B" },
                ]}
                onPress={() => {
                  if (selectionMode) cancelSelectionMode();
                  else {
                    setSelectionMode(true);
                    setSelectedIds([]);
                  }
                }}
              >
                <Text style={adminStyles.buttonText}>
                  {selectionMode ? "Cancelar exclusão" : "Excluir produto"}
                </Text>
              </TouchableOpacity>

              {selectionMode && (
                <TouchableOpacity
                  style={[adminStyles.button, { backgroundColor: "#f98000", marginLeft: 8 }]}
                  onPress={deleteSelectedBulk}
                >
                  <Text style={adminStyles.buttonText}>EXCLUIR SELECIONADOS</Text>
                </TouchableOpacity>
              )}
            </View>

            {productsLoading ? (
              <ActivityIndicator style={{ marginTop: 12 }} />
            ) : (
              <View style={{ marginTop: 12 }}>
                <FlatList
                  data={products}
                  keyExtractor={(p) => String(p.id)}
                  horizontal
                  showsHorizontalScrollIndicator
                  renderItem={({ item }) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <View style={adminStyles.productCard}>
                        {/* checkbox seleção múltipla */}
                        {selectionMode && (
                          <TouchableOpacity
                            style={[
                              adminStyles.checkboxOverlay,
                              isSelected ? adminStyles.checkboxSelected : null,
                            ]}
                            onPress={() => toggleSelect(item.id)}
                          >
                            {isSelected ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
                          </TouchableOpacity>
                        )}

                        {/* lixeira individual */}
                        <TouchableOpacity
                          style={adminStyles.trashOverlay}
                          onPress={() => handleDeleteProduct(item.id)}
                        >
                          <Ionicons name="trash" size={20} color="#fff" />
                        </TouchableOpacity>

                        <View style={adminStyles.imageBox}>
                          {item.image ? (
                            <Image source={{ uri: item.image }} style={adminStyles.productImage} />
                          ) : (
                            <View style={adminStyles.imagePlaceholder}>
                              <Text style={{ color: "#fff" }}>Sem imagem</Text>
                            </View>
                          )}
                        </View>

                        <View style={adminStyles.productInfo}>
                          <Text style={adminStyles.productTitle}>{item.name}</Text>
                          <Text style={adminStyles.productDesc}>{item.description}</Text>
                          <Text style={{ marginTop: 8, fontWeight: "700" }}>
                            R$ {Number(item.price).toFixed(2)}
                          </Text>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 8,
                          }}
                        >
                          <TouchableOpacity
                            style={adminStyles.smallBtn}
                            onPress={() => openEditModal(item)}
                          >
                            <Text style={{ color: "#fff" }}>Editar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[adminStyles.smallBtn, { backgroundColor: "#c00" }]}
                            onPress={() => handleDeleteProduct(item.id)}
                          >
                            <Text style={{ color: "#fff" }}>Lixeira</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={{ color: "#666" }}>Nenhum produto cadastrado.</Text>
                  }
                />
              </View>
            )}

            {/* Add product form */}
            <Text style={[adminStyles.sectionTitle, { marginTop: 20 }]}>Cadastrar produto</Text>
            <Text style={adminStyles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={prodName}
              onChangeText={setProdName}
              placeholder="Nome do produto"
            />
            <Text style={adminStyles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={prodDesc}
              onChangeText={setProdDesc}
              placeholder="Descrição"
              multiline
            />
            <Text style={adminStyles.label}>Preço *</Text>
            <TextInput
              style={styles.input}
              value={prodPrice}
              onChangeText={setProdPrice}
              keyboardType="numeric"
              placeholder="19.90"
            />
            <Text style={adminStyles.label}>Estoque *</Text>
            <TextInput
              style={styles.input}
              value={prodStock}
              onChangeText={setProdStock}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={adminStyles.label}>Imagem</Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TouchableOpacity
                style={adminStyles.button}
                onPress={() => pickImageAsBase64((uri) => setProdImageDataUri(uri))}
              >
                <Text style={adminStyles.buttonText}>
                  {prodImageDataUri ? "Trocar imagem" : "Selecionar imagem"}
                </Text>
              </TouchableOpacity>
              {prodImageDataUri ? (
                <Image
                  source={{ uri: prodImageDataUri }}
                  style={{ width: 80, height: 80, borderRadius: 8 }}
                />
              ) : null}
            </View>

            <TouchableOpacity
              style={[adminStyles.bigSubmit, { marginTop: 16 }]}
              onPress={handleAddProduct}
              disabled={addingProduct}
            >
              <Text style={adminStyles.bigSubmitText}>
                {addingProduct ? "Cadastrando..." : "CADASTRAR PRODUTO"}
              </Text>
            </TouchableOpacity>

            {/* Orders */}
            <Text style={[adminStyles.sectionTitle, { marginTop: 24 }]}>Pedidos</Text>
            <TouchableOpacity
              style={[adminStyles.button, { alignSelf: "flex-start", marginTop: 8 }]}
              onPress={loadOrders}
            >
              <Text style={adminStyles.buttonText}>Carregar pedidos</Text>
            </TouchableOpacity>

            {ordersLoading ? (
              <ActivityIndicator />
            ) : (
              <View style={{ marginTop: 12 }}>
                {orders.length === 0 ? (
                  <Text style={{ color: "#666" }}>Nenhum pedido.</Text>
                ) : (
                  orders.map((o) => (
                    <View
                      key={o.id}
                      style={{
                        padding: 10,
                        borderWidth: 1,
                        borderColor: "#eee",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>Pedido {o.id}</Text>
                      <Text>Valor: R$ {Number(o.total).toFixed(2)}</Text>
                      <Text>Status: {o.status}</Text>
                      <Text>Data: {new Date(o.createdAt).toLocaleString()}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Edit product modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Editar produto
            </Text>
            <Text style={adminStyles.label}>Nome</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            <Text style={adminStyles.label}>Preço</Text>
            <TextInput
              style={styles.input}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
            />
            <Text style={adminStyles.label}>Estoque</Text>
            <TextInput
              style={styles.input}
              value={editStock}
              onChangeText={setEditStock}
              keyboardType="numeric"
            />
            <Text style={adminStyles.label}>Imagem</Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TouchableOpacity
                style={adminStyles.button}
                onPress={() => pickImageAsBase64((uri) => setEditImageDataUri(uri))}
              >
                <Text style={adminStyles.buttonText}>Selecionar imagem</Text>
              </TouchableOpacity>
              {editImageDataUri ? (
                <Image
                  source={{ uri: editImageDataUri }}
                  style={{ width: 80, height: 80, borderRadius: 6 }}
                />
              ) : null}
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <TouchableOpacity style={adminStyles.saveSmall} onPress={saveEditProduct}>
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adminStyles.cancelSmall}
                onPress={() => setEditModalVisible(false)}
              >
                <Text>Fechar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ---------- estilos originais (mantidos) ---------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#215732",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 45,
    gap: 15,
  },
  logo: {
    flex: 1.2,
    height: 60,
    resizeMode: "contain",
  },
  searchContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingLeft: 5,
    fontSize: 14,
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f98000",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Playfair Display Bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontFamily: "Montserrat",
  },

  /* reused input */
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
});

/* ---------- admin styles (modal) ---------- */
const adminStyles = StyleSheet.create({
  topBar: {
    height: 60,
    backgroundColor: "#f98000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  topTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 4 },

  productCard: {
    width: 340,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 12,
    padding: 12,
    position: "relative",
  },
  trashOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  checkboxOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    width: 34,
    height: 34,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  checkboxSelected: {
    backgroundColor: "#38764B",
    borderColor: "#38764B",
  },

  imageBox: {
    height: 160,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#444",
  },
  productInfo: {
    backgroundColor: "#f1f1f1",
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  productTitle: { fontWeight: "700", color: "#333" },
  productDesc: { color: "#666", marginTop: 4 },

  smallBtn: {
    backgroundColor: "#38764B",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  button: {
    backgroundColor: "#38764B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },

  bigSubmit: {
    backgroundColor: "#f98000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  bigSubmitText: { color: "#fff", fontWeight: "700" },

  label: { fontSize: 14, fontWeight: "700", color: "#333", marginTop: 8 },

  saveSmall: { backgroundColor: "#38764B", padding: 12, borderRadius: 8 },
  cancelSmall: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginLeft: 8 },
});
