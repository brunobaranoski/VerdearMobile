import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
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

// Componente Placeholder para itens do carrinho
const CartContentPlaceholder = () => (
  <View style={styles.cartContentPlaceholder}>
    <Icon name="image" size={40} color="#B0D88E" />
  </View>
);

// Gradiente lateral laranja
const SideGradient = ({ style }) => (
  <LinearGradient
    colors={['#FF9800', '#FFB74D']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={style}
  />
);

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Produto 1', quantity: 1, price: 25.9 },
    { id: 2, name: 'Produto 2', quantity: 1, price: 35.5 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const updateQuantity = (id, change) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => setCartItems((prev) => prev.filter((item) => item.id !== id));
  const total = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

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

      <View style={styles.screenContent}>
        {/* Gradiente Lateral Esquerdo */}
        <SideGradient style={styles.leftGradient} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section Header - Carrinho */}
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#FF9800', '#FFB74D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cartIconGradient}
            >
              <Icon name="shopping-cart" size={20} color="#fff" />
            </LinearGradient>
          </View>

          {cartItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <CartContentPlaceholder />
              <View style={styles.itemInfo}>
                {/* Nome do item (mantido para visualização) */}
                <Text style={styles.itemName}>{item.name}</Text> 
                <View style={styles.quantityRemoveContainer}>
                  {/* Container de Quantidade com Gradiente */}
                  <LinearGradient
                    colors={['#FFB74D', '#FF9800']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quantityGradient}
                  >
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                  {/* Ícone de Excluir */}
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                    <Icon name="delete-outline" size={26} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* TOTAL */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>TOTAL</Text>
            <View style={styles.totalValueContainer}>
              <Text style={styles.totalValue}>--------------</Text>
              <TouchableOpacity style={styles.totalButton}>
                <Text style={styles.totalButtonText}>R$ {total.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CUPOM */}
          <Text style={styles.label}>CUPOM</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o cupom"
            placeholderTextColor="#999"
          />

          {/* PAGAMENTO */}
          <Text style={styles.label}>PAGAMENTO</Text>
          <View style={styles.paymentContainer}>
            <TouchableOpacity
              style={[styles.paymentButton, paymentMethod === 'CARTAO' && styles.activePaymentButton]}
              onPress={() => setPaymentMethod('CARTAO')}
            >
              <Text style={[styles.paymentText, paymentMethod === 'CARTAO' && styles.activePaymentText]}>CARTÃO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentButton, paymentMethod === 'PIX' && styles.activePaymentButton]}
              onPress={() => setPaymentMethod('PIX')}
            >
              <LinearGradient
                colors={['#FF9800', '#FFB74D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.pixGradientButton}
              >
                <Text style={styles.pixText}>PIX</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ENTREGA */}
          <Text style={styles.label}>ENTREGA</Text>
          <TextInput
            style={styles.input}
            placeholder="Calcular frete"
            placeholderTextColor="#999"
          />

          {/* FINALIZAR */}
          <TouchableOpacity
            onPress={() => Alert.alert('Pedido finalizado!')}
            style={styles.finalButton}
          >
            <LinearGradient
              colors={['#FFB74D', '#FF9800']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.finalGradient}
            >
              <Text style={styles.finalButtonText}>FINALIZAR</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Gradiente Lateral Direito */}
        <SideGradient style={styles.rightGradient} />
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="chat" size={24} color="#fff" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="shopping-cart" size={24} color="#FF9800" />
          <Text style={[styles.navText, styles.activeNavText]}>Compras</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="person" size={24} color="#fff" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
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
  
  screenContent: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative', 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 25, 
    zIndex: 1, 
    backgroundColor: 'transparent',
  },
  
  // Gradientes laterais
  leftGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 25, 
    transform: [{ translateX: -10 }], 
  },
  rightGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 25, 
    transform: [{ translateX: 10 }], 
  },

  // Componentes de Carrinho
  sectionHeader: { 
    marginTop: 20, 
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  cartIconGradient: {
    padding: 8,
    borderRadius: 8,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', 
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartContentPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E6F4E6',
    borderColor: '#B0D88E',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { 
    flex: 1, 
    marginLeft: 15,
    justifyContent: 'center', 
  },
  itemName: {
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5
  },
  quantityRemoveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  quantityGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 2,
    backgroundColor: '#FF9800', 
  },
  quantityButton: {
    backgroundColor: 'transparent',
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantityText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#fff',
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  removeButton: {
    padding: 5,
  },
  
  // Total
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  totalValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  totalValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#999' 
  },
  totalButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  totalButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  // Formulário
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  
  // Pagamento
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },
  paymentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
    marginRight: 10, 
    backgroundColor: '#fff',
  },
  activePaymentButton: {
    borderWidth: 0, 
  },
  paymentText: { 
    color: '#FF9800', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  pixGradientButton: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
  },
  pixText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Finalizar
  finalButton: {
    marginTop: 30,
    marginBottom: 50, 
    borderRadius: 10,
    overflow: 'hidden',
  },
  finalGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  finalButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#38764B', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 0, 
    borderTopRightRadius: 0, 
  },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#fff', fontSize: 12, marginTop: 4 },
  activeNavText: { fontWeight: 'bold', color: '#FF9800' }, 
});

export default CartScreen;