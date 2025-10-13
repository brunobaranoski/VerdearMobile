import { LinearGradient } from 'expo-linear-gradient';
import {
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

// Componente Placeholder simples para categorias e produtos
const ContentPlaceholder = ({ iconName, iconSize, color, style }) => (
  <View style={[styles.contentPlaceholder, style]}>
    <Icon name={iconName} size={iconSize} color={color} />
  </View>
);

const HomeScreen = () => {
  const categories = [
    { id: 1, name: 'Categoria' },
    { id: 2, name: 'Categoria' },
    { id: 3, name: 'Categoria' },
    { id: 4, name: 'Categoria' },
    { id: 5, name: 'Categoria' },
    { id: 6, name: 'Categoria' },
  ];

  const products = [
    { id: 1, name: 'Produto 1', price: 'R$ 25,00' },
    { id: 2, name: 'Produto 2', price: 'R$ 40,00' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* LOGO */}
        <Image
          source={require('../../assets/images/logo-branca.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner/Vitrine */}
        <View style={styles.bannerContainer}>
          {/* Imagem de Fundo */}
          <Image
            source={require('../../assets/images/header-principal.png')} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
          
          {/* Overlay de Gradiente Branca (Simulando o efeito do protótipo) */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            locations={[0, 0.2, 0.8]}
            style={styles.bannerOverlay}
          />

          {/* Textos de Overlay */}
          <Text style={styles.bannerTextLeft}>Sua vitrine</Text>
          <Text style={styles.bannerTextRight}>para o campo</Text>
        </View>

        {/* Categorias */}
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

        {/* Produtos em destaque */}
        <View style={styles.sectionHeader}>
          <Icon name="star" size={22} color="#FF9800" /> 
          <Text style={styles.sectionTitle}>Produtos em destaque</Text>
        </View>

        <View style={styles.productsGrid}>
          {products.map((item) => (
            <View key={item.id} style={styles.productCard}>
              {/* Imagem Placeholder do Produto */}
              <ContentPlaceholder iconName="eco" iconSize={50} color="#B0D88E" style={styles.productImagePlaceholderView} />
              
              {/* Rating/Gradiente */}
              <View style={styles.productButtonContainer}>
                <LinearGradient
                  colors={['#FFB74D', '#FF9800']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ratingButton}
                >
                  {[...Array(5)].map((_, i) => <Icon key={i} name="star" size={12} color="#fff" />)}
                </LinearGradient>
              </View>
              
              {/* Detalhes do Produto */}
              <View style={styles.productDetails}>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.productName}>{item.name}</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>ADICIONAR</Text>
                  <Text style={styles.productPrice}>{item.price}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* A Barra de Navegação Inferior (Bottom Nav) FOI REMOVIDA */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#38764B', // Cor verde escura
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoImage: { 
    width: 100, 
    height: 40, 
    marginLeft: -10, 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50, 
    paddingHorizontal: 15,
    width: '65%', 
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#333', paddingVertical: 0 },
  scrollContent: { paddingBottom: 20 },
  
  // Banner/Vitrine Styles
  bannerContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    height: 150, 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // Note: Mantive o gradiente branco para simular o efeito do protótipo
  },
  bannerTextLeft: {
    position: 'absolute',
    left: 20,
    top: '30%',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerTextRight: {
    position: 'absolute',
    right: 20,
    top: '60%',
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Category Styles
  categorySection: {
    backgroundColor: '#F7FFF0', 
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  card: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  cardText: { color: '#333', fontWeight: '500', fontSize: 12, textAlign: 'center' },
  
  // Content Placeholder base
  contentPlaceholder: {
    backgroundColor: '#E6F4E6', 
    borderColor: '#B0D88E', 
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  
  // Product Styles
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginHorizontal: 15, 
    gap: 5, 
    marginBottom: 10 
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  productCard: {
    width: '47%',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden', 
    position: 'relative',
  },
  productImagePlaceholderView: {
    width: '100%',
    height: 100, 
    borderRadius: 0, 
    borderWidth: 0,
    backgroundColor: '#E6F4E6',
  },
  productDetails: {
    backgroundColor: '#38764B', 
    padding: 8,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderBottomRightRadius: 10,
  },
  detailTextContainer: {
    flex: 1,
    paddingRight: 5,
  },
  productName: { fontWeight: 'bold', color: '#fff', fontSize: 12 },
  
  addButton: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  productPrice: { 
    color: '#fff', 
    fontSize: 10, 
    marginTop: 2, 
    fontWeight: '500', 
    textAlign: 'center' 
  },
  
  // O styles.bottomNav foi removido.
});

export default HomeScreen;