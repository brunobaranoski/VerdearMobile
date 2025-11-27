import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- CONFIGURAÇÃO DO FIRESTORE E CARRINHO ---
const CARTS_COLLECTION = 'carts';
const ITEMS_SUBCOLLECTION = 'items';
const PRODUCTS_COLLECTION = 'products'; // Coleção de produtos

// Placeholder Componente
const ContentPlaceholder = ({ iconName, iconSize, color, style }) => (
  <View style={[styles.contentPlaceholder, style]}>
    <Icon name={iconName} size={iconSize} color={color} />
  </View>
);

const HomeScreen = () => {
  // --- USO CORRETO DO useAuth PARA VERIFICAR O ESTADO ---
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]); 
  const [loadingProducts, setLoadingProducts] = useState(true);
  const unsubscribeRef = useRef(null);
  
  const categories = [
    { id: 1, name: 'Categoria' },
    { id: 2, name: 'Categoria' },
    { id: 3, name: 'Categoria' },
    { id: 4, name: 'Categoria' },
    { id: 5, name: 'Categoria' },
    { id: 6, name: 'Categoria' },
  ];

  // --- FUNÇÃO DE CARREGAMENTO DE PRODUTOS DO FIRESTORE ---
  useEffect(() => {
    // 1. Não executa nada se o estado de autenticação ainda estiver carregando
    if (authLoading) return;

    // 2. Não executa nada se o usuário não estiver logado
    if (!user) {
        setProducts([]);
        setLoadingProducts(false);
        if (unsubscribeRef.current) unsubscribeRef.current();
        return;
    }

    setLoadingProducts(true);
    
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    if (unsubscribeRef.current) unsubscribeRef.current();

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        price: Number(doc.data().price) || 0,
      }));
      setProducts(list);
      setLoadingProducts(false);
    }, (error) => {
      console.error("Erro ao carregar catálogo:", error);
      Alert.alert("Erro", "Não foi possível carregar o catálogo de produtos.");
      setLoadingProducts(false);
    });

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [user, authLoading]); // Dependências corrigidas
  // -------------------------------------------------------------

  const parsePrice = (price) => {
    try {
      const s = String(price).replace(/[^0-9,,-.]/g, '').replace(',', '.');
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  };

  const saveItemToCart = async (item) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar itens ao carrinho.');
      return false;
    }

    const userId = user.uid;
    const productId = item.id; 
    const itemPrice = parsePrice(item.price);
    
    const itemDocRef = doc(db, CARTS_COLLECTION, userId, ITEMS_SUBCOLLECTION, productId);

    try {
      const docSnap = await getDoc(itemDocRef);
      let newQuantity = 1;

      if (docSnap.exists()) {
        const data = docSnap.data();
        newQuantity = (data.quantity || 0) + 1;
      }

      await setDoc(itemDocRef, {
        productId: productId,
        name: item.name,
        price: itemPrice,
        quantity: newQuantity,
      });

      return true;
    } catch (err) {
      console.error('Erro ao salvar item no Firestore:', err);
      return false;
    }
  };

  async function addToCart(product) {
    const saved = await saveItemToCart(product);

    if (saved) {
      Alert.alert('Sucesso', `"${product.name}" adicionado ao carrinho.`);
      router.push('/(tabs)/compras'); 
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar ao carrinho.');
    }
    return null;
  }

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (authLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#38764B" />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }
  
  if (!user) {
       // Este caso deve ser raro devido ao _layout.tsx, mas é um bom fallback
       return (
          <View style={styles.loadingScreen}>
            <Text style={styles.noUserText}>Faça login para ver o catálogo.</Text>
          </View>
        );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo-branca.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Pesquisar..." placeholderTextColor="#999" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image source={require('../../assets/images/header-principal.png')} style={styles.bannerImage} resizeMode="cover" />
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} locations={[0,0.2,0.8]} style={styles.bannerOverlay} />
          <Text style={styles.bannerTextLeft}>Sua vitrine</Text>
          <Text style={styles.bannerTextRight}>para o campo</Text>
        </View>

        <View style={styles.categorySection}>
          <View style={styles.grid}>
            {categories.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <ContentPlaceholder iconName="landscape" iconSize={40} color="#B0D88E" />
                <Text style={styles.cardText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Icon name="star" size={22} color="#FF9800" />
          <Text style={styles.sectionTitle}>Produtos em destaque</Text>
        </View>

        {/* --- LISTAGEM DE PRODUTOS DO FIRESTORE --- */}
        {loadingProducts ? (
            <ActivityIndicator size="large" color="#FF9800" style={{ marginTop: 20 }} />
        ) : (
             products.length > 0 ? (
                <View style={styles.productsGrid}>
                  {products.map((item) => (
                    <View key={item.id} style={styles.productCard}>
                      <ContentPlaceholder iconName="eco" iconSize={50} color="#B0D88E" style={styles.productImagePlaceholderView} /> 
                      <View style={styles.productButtonContainer}>
                        <LinearGradient colors={['#FFB74D', '#FF9800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ratingButton}>
                          {[...Array(5)].map((_, i) => <Icon key={i} name="star" size={12} color="#fff" />)}
                        </LinearGradient>
                      </View>

                      <View style={styles.productDetails}>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.productName}>{item.name}</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                          <Text style={styles.addButtonText}>ADICIONAR</Text>
                          <Text style={styles.productPrice}>R$ {Number(item.price).toFixed(2).replace('.', ',')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
             ) : (
                 <Text style={styles.noProductsText}>Nenhum produto encontrado. Cadastre alguns no Perfil.</Text>
             )
        )}
        {/* ------------------------------------------- */}
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos (mantidos)
const styles = StyleSheet.create({
  // Estilos adicionais para tela de loading/erro
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  noUserText: {
     textAlign: 'center',
     color: '#C70039',
     fontSize: 18,
     fontWeight: 'bold',
  },
  
  // Estilos originais
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#38764B', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  logoImage: { width: 120, height: 50, marginLeft: -10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 50, paddingHorizontal: 15, width: '65%', height: 40, elevation: 3 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#333', paddingVertical: 0 },
  scrollContent: { paddingBottom: 20 },
  bannerContainer: { marginVertical: 10, marginHorizontal: 15, borderRadius: 15, overflow: 'hidden', height: 150, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bannerImage: { width: '100%', height: '100%', position: 'absolute' },
  bannerOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  bannerTextLeft: { position: 'absolute', left: 20, top: '30%', color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bannerTextRight: { position: 'absolute', right: 20, top: '60%', color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  categorySection: { backgroundColor: '#F7FFF0', marginHorizontal: 15, borderRadius: 15, padding: 10, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 5 },
  card: { width: '30%', alignItems: 'center', paddingVertical: 10, marginBottom: 10 },
  cardText: { color: '#333', fontWeight: '500', fontSize: 12, textAlign: 'center' },
  contentPlaceholder: { backgroundColor: '#E6F4E6', borderColor: '#B0D88E', borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', width: 60, height: 60, marginBottom: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, gap: 5, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 15 },
  productCard: { width: '47%', borderRadius: 15, marginBottom: 20, overflow: 'hidden', position: 'relative' },
  productImagePlaceholderView: { width: '100%', height: 100, borderRadius: 0, borderWidth: 0, backgroundColor: '#E6F4E6' },
  productDetails: { backgroundColor: '#38764B', padding: 8, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productButtonContainer: { position: 'absolute', top: 0, left: 0, zIndex: 10, overflow: 'hidden' },
  ratingButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: 5, borderBottomRightRadius: 10 },
  detailTextContainer: { flex: 1, paddingRight: 5 },
  productName: { fontWeight: 'bold', color: '#fff', fontSize: 12 },
  addButton: { backgroundColor: '#FF9800', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  productPrice: { color: '#fff', fontSize: 10, marginTop: 2, fontWeight: '500', textAlign: 'center' },
});

export default HomeScreen;