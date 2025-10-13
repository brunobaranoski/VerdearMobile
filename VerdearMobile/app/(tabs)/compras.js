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

// Componente Placeholder para Detalhes do Cartão
const CardDetails = ({ onClose }) => (
  <View style={styles.detailsContainer}>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Icon name="close" size={24} color="#999" />
    </TouchableOpacity>
    <TextInput style={styles.inputDetails} placeholder="Número do Cartão" placeholderTextColor="#666" />
    <TextInput style={styles.inputDetails} placeholder="Nome do Titular" placeholderTextColor="#666" />
    <View style={styles.row}>
      <TextInput style={[styles.inputDetails, styles.inputHalf]} placeholder="Validade (MM/AA)" placeholderTextColor="#666" />
      <TextInput style={[styles.inputDetails, styles.inputHalf]} placeholder="CVV" placeholderTextColor="#666" />
    </View>
    <TouchableOpacity style={styles.parcelasButton}>
        <Text style={styles.parcelasText}>Selecione as Parcelas</Text>
    </TouchableOpacity>
  </View>
);

// NOVO Componente Placeholder para Detalhes do PIX
const PixDetails = ({ onClose }) => (
  <View style={[styles.detailsContainer, styles.pixContainer]}>
    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
      <Icon name="close" size={24} color="#999" />
    </TouchableOpacity>
    <Text style={styles.pixTitle}>Chave PIX (CNPJ: 00.000.000/0001-00)</Text>
    <View style={styles.pixKeyBox}>
        <Text style={styles.pixKeyText}>A8C8C80A-00A0-4C00-00A0-B00C00000000</Text>
    </View>
    <TouchableOpacity style={styles.copyButton}>
        <Icon name="content-copy" size={20} color="#fff" />
        <Text style={styles.copyButtonText}>COPIAR CHAVE</Text>
    </TouchableOpacity>
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
  const [paymentMethod, setPaymentMethod] = useState('CARTAO');
  const [cardDetailsVisible, setCardDetailsVisible] = useState(true); 
  const [pixDetailsVisible, setPixDetailsVisible] = useState(false); 

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

  const handlePaymentSelect = (method) => {
    if (method === 'CARTAO') {
      const shouldToggle = paymentMethod === 'CARTAO' && cardDetailsVisible;
      setCardDetailsVisible(!shouldToggle);
      setPixDetailsVisible(false);
      setPaymentMethod('CARTAO');
    } else if (method === 'PIX') {
      const shouldToggle = paymentMethod === 'PIX' && pixDetailsVisible;
      setPixDetailsVisible(!shouldToggle);
      setCardDetailsVisible(false);
      setPaymentMethod('PIX');
    }
  };
  
  // Função para fechar os detalhes
  const handleCloseDetails = () => {
    setCardDetailsVisible(false);
    setPixDetailsVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* LOGO */}
        <Image
          source={require('../../assets/images/logo-branca.png')} 
          style={styles.logoImage} // <-- Estilo alterado para ser maior
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

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
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
                <Text style={styles.itemName}>{item.name}</Text> 
                <View style={styles.quantityRemoveContainer}>
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
              {/* PONTILHADO AUMENTADO AQUI */}
              <Text style={styles.totalValue}>--------------------</Text> 
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
            {/* BOTÃO CARTÃO */}
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={() => handlePaymentSelect('CARTAO')}
            >
              {paymentMethod === 'CARTAO' ? (
                // ESTADO ATIVO (Laranja preenchido)
                <LinearGradient
                  colors={['#FF9800', '#FFB74D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.paymentInnerWrapper, styles.cardActiveFill]}
                >
                  <Text style={styles.pixText}>CARTÃO</Text>
                </LinearGradient>
              ) : (
                // ESTADO INATIVO (Branco com borda laranja)
                <View style={[styles.paymentInnerWrapper, styles.cardInactiveOutline]}>
                  <Text style={styles.paymentText}>CARTÃO</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* BOTÃO PIX */}
            <TouchableOpacity
              style={styles.paymentButton} 
              onPress={() => handlePaymentSelect('PIX')}
            >
              {paymentMethod === 'PIX' ? (
                // ESTADO ATIVO (Laranja preenchido)
                <LinearGradient
                  colors={['#FF9800', '#FFB74D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.paymentInnerWrapper, styles.cardActiveFill]}
                >
                  <Text style={styles.pixText}>PIX</Text>
                </LinearGradient>
              ) : (
                // ESTADO INATIVO (Branco com borda laranja)
                <View style={[styles.paymentInnerWrapper, styles.cardInactiveOutline]}>
                  <Text style={styles.paymentText}>PIX</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* DETALHES EXPANSÍVEIS */}
          {paymentMethod === 'CARTAO' && cardDetailsVisible && <CardDetails onClose={handleCloseDetails} />}
          {paymentMethod === 'PIX' && pixDetailsVisible && <PixDetails onClose={handleCloseDetails} />}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#38764B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoImage: { 
    // ***** AJUSTE DE TAMANHO AQUI *****
    width: 120, // Aumentado de 100 para 120
    height: 50, // Aumentado de 40 para 50
    // ***********************************
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
  scrollContentContainer: {
    paddingBottom: 20, 
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
  
  // Pagamento (Botões)
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, 
    marginTop: 5,
    marginBottom: 10,
  },
  paymentButton: {
    flex: 1, 
    minHeight: 45, 
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent', 
    overflow: 'hidden', 
  },
  
  // Wrapper interno usado para aplicar a borda ou o gradiente, garantindo o mesmo tamanho
  paymentInnerWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // ESTADO INATIVO (Branco com Borda Laranja)
  cardInactiveOutline: {
    backgroundColor: '#fff',
    borderWidth: 2, 
    borderColor: '#FF9800',
  },
  
  paymentText: { 
    color: '#FF9800', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  
  // ESTADO ATIVO (Gradiente Laranja - Ocupa 100% do botão)
  cardActiveFill: {
    // Estilos já definidos no LinearGradient
  },

  pixText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  
  // Detalhes Expansíveis (Base)
  detailsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'relative', 
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
    padding: 5,
  },

  // Detalhes do Cartão
  inputDetails: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
  },
  parcelasButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  parcelasText: {
    color: '#333',
    fontWeight: 'bold',
  },
  
  // Detalhes do PIX
  pixContainer: {
      alignItems: 'center',
  },
  pixTitle: {
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
  },
  pixKeyBox: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      padding: 10,
      borderRadius: 8,
      width: '100%',
      marginBottom: 15,
      alignItems: 'center',
  },
  pixKeyText: {
      color: '#666',
      fontSize: 14,
      textAlign: 'center',
  },
  copyButton: {
      backgroundColor: '#38764B',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      gap: 5,
  },
  copyButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
  },

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
});

export default CartScreen;