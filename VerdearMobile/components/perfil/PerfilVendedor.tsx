// components/perfil/PerfilVendedor.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// Ajuste esse import caso o caminho do seu AuthContext seja diferente.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../app/context/AuthContext";
import { Toast } from "../shared/Index";
import EditarCadastro from "./EditarCadastro";

const STORAGE_KEY = "APP_PRODUCTS_V1";

const MenuItem = ({ iconName, text, onPress, isActive = false, isLogout = false }) => (
  <TouchableOpacity
    style={[styles.menuItem, isActive && styles.menuItemActive]}
    onPress={onPress}
  >
    {iconName ? (
      <Ionicons
        name={iconName}
        size={24}
        color={isLogout ? "#F44336" : (isActive ? "#f98000" : "#555")}
      />
    ) : (
      <View style={{ width: 24 }} />
    )}
    <Text style={[
      styles.menuText,
      isActive && { color: "#f98000", fontWeight: "600" },
      isLogout && { color: "#F44336", fontWeight: "600" }
    ]}>
      {text}
    </Text>
    {!isLogout && <Ionicons name="chevron-forward-outline" size={20} color="#999" />}
  </TouchableOpacity>
);

const ProductCard = ({ item, updateProductField, onPickImage, onDeleteSingle }) => {
  return (
    <View key={item.id} style={styles.productCard}>
      <ImageBackground
        source={ item.image ? { uri: item.image } : { uri: 'https://i.imgur.com/J8iL34j.png' } }
        style={styles.cardImage}
        imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      >
        <View style={styles.cardOverlay}>
          <TextInput
            style={styles.cardNomeInput}
            placeholder="NOME"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={item.nome}
            onChangeText={(text) => updateProductField(item.id, 'nome', text)}
          />
          <TextInput
            style={styles.cardDescricaoInput}
            placeholder="Descrição"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={item.descricao}
            onChangeText={(text) => updateProductField(item.id, 'descricao', text)}
          />
        </View>

        <TouchableOpacity style={styles.cardImagePicker} onPress={() => onPickImage(item.id)}>
          <Ionicons name="image-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardTrashBadge}
          onPress={() => {
            // chama a exclusão com confirmação por padrão
            if (typeof onDeleteSingle === 'function') onDeleteSingle(item.id);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.cardValuesSection}>
        <TextInput
          style={styles.cardValorTextInput}
          placeholder="Valores"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={item.valor}
          onChangeText={(text) => updateProductField(item.id, 'valor', text)}
        />
      </View>
    </View>
  );
};

export default function PerfilVendedor() {
  const { user, userData, logout, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('cadastrar-produtos');

  const [produtos, setProdutos] = useState(() => [
    { id: "1", nome: "Produto 1", descricao: "Descrição do produto 1", valor: "10.00", image: null },
    { id: "2", nome: "Produto 2", descricao: "Descrição do produto 2", valor: "20.00", image: null },
    { id: "3", nome: "Produto 3", descricao: "Descrição do produto 3", valor: "30.00", image: null },
  ]);

  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Carrega catálogo quando a aba é selecionada
  useEffect(() => {
    if (activeSection === 'catalogo') loadCatalogFromStorage();
  }, [activeSection]);

  // Carrega produtos salvos inicialmente (preenche catálogo)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setCatalogProducts(Array.isArray(parsed) ? parsed : []);
        }
      } catch (err) {
        console.warn("Erro ao carregar produtos salvos:", err);
      }
    })();
  }, []);

  const loadCatalogFromStorage = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setCatalogProducts([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setCatalogProducts(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.warn("Erro ao carregar catálogo:", err);
      setCatalogProducts([]);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Até logo! Você saiu da sua conta.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao sair. Tente novamente.', 'error');
    }
  };

  const adicionarProduto = () => {
    const novoId = Date.now().toString();
    const novoProduto = { id: novoId, nome: "", descricao: "", valor: "", image: null };
    setProdutos(prev => [...prev, novoProduto]);
  };

  const updateProductField = (id: string, field: string, value: string) => {
    setProdutos(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  // Seleciona imagem para um produto (salva como data URI quando disponível)
  const pickImageForProduct = async (id: string) => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permissão necessária", "Permita acesso à galeria para adicionar imagens.");
          return;
        }
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      });

      // compatibilidade com diferentes versões
      if ((res as any).cancelled === true) return;
      if ((res as any).canceled === true) return;
      const asset = (res as any).assets ? (res as any).assets[0] : res;
      if (!asset) return;

      const mime = asset.uri && asset.uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const base64 = asset.base64 || (res as any).base64;
      if (!base64) {
        // fallback: usa apenas uri
        const uri = asset.uri;
        setProdutos(prev => prev.map(p => p.id === id ? { ...p, image: uri } : p));
        return;
      }
      const dataUri = `data:${mime};base64,${base64}`;
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, image: dataUri } : p));
    } catch (err) {
      console.error("Erro ao selecionar imagem:", err);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  // Salva produtos válidos no AsyncStorage (catálogo)
  const handleSaveProductsToCatalog = async () => {
    try {
      const cleaned = produtos.filter(p =>
        (p.nome && p.nome.trim().length > 0) ||
        (p.valor && p.valor.toString().trim().length > 0) ||
        (p.image)
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      showToast('Produtos salvos no catálogo!', 'success');
      if (activeSection === 'catalogo') setCatalogProducts(cleaned);
    } catch (err) {
      console.error("Erro ao salvar produtos:", err);
      showToast('Erro ao salvar produtos.', 'error');
    }
  };

  // --- Função de debug: imprime conteúdo do storage ---
  const debugShowStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      console.log("[DEBUG] Conteúdo do storage:", raw);
      const parsed = raw ? JSON.parse(raw) : [];
      console.log("[DEBUG] parsed (array length):", Array.isArray(parsed) ? parsed.length : "não é array");
    } catch (err) {
      console.error("[DEBUG] Erro ao ler storage:", err);
    }
  };

  // --- delete imediato (sem confirm) - útil para teste ---
  const deleteCatalogItemImmediate = async (id: string) => {
    try {
      console.log(`[TEST DELETE] tentativa de remover id=${id}`);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const array = Array.isArray(parsed) ? parsed : [];
      const exists = array.some((p: any) => p.id === id);
      console.log(`[TEST DELETE] item existe no storage? ${exists}`);
      const filtered = array.filter((p: any) => p.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setCatalogProducts(filtered);
      setProdutos(prev => prev.filter(p => p.id !== id));
      showToast('Produto excluído do catálogo (teste)', 'success');
      console.log(`[TEST DELETE] removido id=${id}. restantes=${filtered.length}`);
    } catch (err) {
      console.error("[TEST DELETE] erro ao excluir:", err);
      showToast('Erro ao excluir produto (teste)', 'error');
    }
  };

  // --- FUNÇÃO DE EXCLUSÃO RECOMENDADA (com confirmação e logs) ---
  const deleteCatalogItem = async (id: string) => {
    try {
      console.log("[deleteCatalogItem] solicitada exclusão id=", id);
      Alert.alert(
        "Excluir produto",
        "Deseja excluir este produto do catálogo?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                console.log("[deleteCatalogItem] confirmada exclusão id=", id);
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : [];
                const array = Array.isArray(parsed) ? parsed : [];
                const filtered = array.filter((p: any) => p.id !== id);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
                setCatalogProducts(filtered);
                setProdutos(prev => prev.filter(p => p.id !== id));
                showToast('Produto excluído do catálogo', 'success');
                console.log(`[deleteCatalogItem] removido id=${id}. restantes=${filtered.length}`);
              } catch (err) {
                console.error("[deleteCatalogItem] erro ao excluir:", err);
                showToast('Erro ao excluir produto', 'error');
              }
            }
          }
        ],
        { cancelable: true }
      );
    } catch (err) {
      console.error("[deleteCatalogItem] erro no fluxo:", err);
      showToast('Erro inesperado ao excluir produto', 'error');
    }
  };

  const renderMainContent = () => {
    if (activeSection === 'alterar-cadastro') {
      return <EditarCadastro />;
    }

    if (activeSection === 'catalogo') {
      return (
        <View style={styles.mainContent}>
          <View style={styles.mainHeader}>
            <Ionicons name="grid-outline" size={24} color="#555" />
            <Text style={styles.mainTitle}>Catálogo de produtos</Text>
          </View>

          {catalogProducts.length === 0 ? (
            <View style={{ paddingTop: 40 }}>
              <Text style={styles.emptyText}>Nenhum produto cadastrado.</Text>
              <TouchableOpacity
                style={[styles.submitButton, { alignSelf: 'center', marginTop: 16 }]}
                onPress={loadCatalogFromStorage}
              >
                <Text style={styles.submitButtonText}>Recarregar catálogo</Text>
              </TouchableOpacity>

              {/* Para debugging rápido: mostrar conteúdo do storage */}
              <TouchableOpacity
                style={[styles.smallDebugButton]}
                onPress={debugShowStorage}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>DEBUG STORAGE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={catalogProducts}
              keyExtractor={(p) => p.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <ImageBackground
                    source={item.image ? { uri: item.image } : { uri: 'https://i.imgur.com/J8iL34j.png' }}
                    style={styles.cardImage}
                    imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                  >
                    <View style={styles.cardOverlay}>
                      <Text style={styles.titleCardNome} numberOfLines={1}>{item.nome || 'Sem nome'}</Text>
                      <Text style={styles.titleCardDesc} numberOfLines={2}>{item.descricao || ''}</Text>
                    </View>

                    <TouchableOpacity style={styles.cardTrashBadge} onPress={() => deleteCatalogItem(item.id)}>
                      <Ionicons name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                  </ImageBackground>

                  <View style={styles.cardValuesSection}>
                    <Text style={{ color: '#333', fontWeight: '700' }}>R$ {Number(item.valor || 0).toFixed(2)}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      );
    }

    if (activeSection === 'pedidos') {
      return (
        <View style={styles.mainContent}>
          <View style={styles.mainHeader}>
            <Ionicons name="cube-outline" size={24} color="#555" />
            <Text style={styles.mainTitle}>Pedidos</Text>
          </View>
          <Text style={styles.emptyText}>Em desenvolvimento</Text>
        </View>
      );
    }

    // Cadastrar produtos (default)
    return (
      <>
        <View style={styles.mainHeader}>
          <Ionicons name="document-text-outline" size={24} color="#555" />
          <Text style={styles.mainTitle}>Cadastrar produtos</Text>
        </View>

        <ScrollView contentContainerStyle={styles.productsGrid} style={{ flex: 1 }}>
          {produtos.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              updateProductField={updateProductField}
              onPickImage={pickImageForProduct}
              onDeleteSingle={(id) => {
                // exclusão direta no editor (sem confirmação)
                setProdutos(prev => prev.filter(p => p.id !== id));
              }}
            />
          ))}

          <TouchableOpacity style={styles.addCard} onPress={adicionarProduto}>
            <Text style={styles.addCardPlus}>+</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleSaveProductsToCatalog}>
          <Text style={styles.submitButtonText}>CADASTRAR PRODUTOS</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userData?.avatar || "https://i.imgur.com/6aFj4OK.png" }}
              style={styles.avatar}
            />
            <View style={styles.editIconWrapper}>
              <Ionicons name="pencil" size={12} color="white" />
            </View>
          </View>
          <Text style={styles.profileName}>{userData?.name || "Usuário"}</Text>
          <Text style={styles.profileEmail}>{userData?.email || user?.email || ""}</Text>
          <Text style={styles.profileRole}>{userData?.userType || "Vendedor"}</Text>
        </View>

        <View style={styles.configSection}>
          <Text style={styles.configTitle}>Configurações</Text>
        </View>

        <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
          <MenuItem
            iconName="cog-outline"
            text="Alterar cadastro"
            onPress={() => setActiveSection('alterar-cadastro')}
            isActive={activeSection === 'alterar-cadastro'}
          />
          <MenuItem
            iconName="grid-outline"
            text="Catálogo de produtos"
            onPress={() => setActiveSection('catalogo')}
            isActive={activeSection === 'catalogo'}
          />
          <MenuItem
            iconName="document-text-outline"
            text="Cadastrar produtos"
            onPress={() => setActiveSection('cadastrar-produtos')}
            isActive={activeSection === 'cadastrar-produtos'}
          />
          <MenuItem
            iconName="cube-outline"
            text="Pedidos"
            onPress={() => setActiveSection('pedidos')}
            isActive={activeSection === 'pedidos'}
          />

          <View style={styles.menuDivider} />

          <MenuItem
            iconName="log-out-outline"
            text={loading ? "Saindo..." : "Sair"}
            onPress={handleLogout}
            isLogout={true}
          />
        </ScrollView>
      </View>

      <View style={styles.mainContent}>
        {renderMainContent()}
      </View>

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

// ---------- estilos (mantive seu visual e acrescentei pequenos extras) ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  sidebar: {
    width: "40%",
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#EFEFEF",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E0F2FF'
  },
  editIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1E90FF",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: 'center'
  },
  profileEmail: {
    fontSize: 10,
    color: "#777",
    textAlign: 'center'
  },
  profileRole: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  configSection: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  configTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444'
  },
  menu: {
    flex: 1,
    marginTop: 10
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#FFF5E6',
    borderLeftWidth: 3,
    borderLeftColor: '#f98000',
  },
  menuText: {
    flex: 1,
    fontSize: 9,
    color: "#444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginTop: 40,
    fontFamily: 'Montserrat',
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 25,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '47%',
    aspectRatio: 0.85,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    height: '65%',
    justifyContent: 'flex-end',
  },
  cardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 10,
  },
  cardNomeInput: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    padding: 0,
    margin: 0,
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardDescricaoInput: {
    color: 'white',
    fontSize: 12,
    padding: 0,
    margin: 0,
  },
  cardValuesSection: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  cardValorTextInput: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 5,
  },
  addCard: {
    width: '47%',
    aspectRatio: 0.85,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardPlus: {
    fontSize: 60,
    color: '#D0D0D0',
    fontWeight: '200',
  },
  submitButton: {
    backgroundColor: "#f98000",
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  // novos / atualizados
  cardImagePicker: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 6,
    borderRadius: 6,
  },
  cardTrashBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  smallDebugButton: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#38764B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleCardNome: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  titleCardDesc: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
  },
});
