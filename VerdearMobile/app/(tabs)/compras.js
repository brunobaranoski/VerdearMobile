import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

// --- CONFIGURAÇÃO DE PERSISTÊNCIA ---
const CARTS_COLLECTION = 'carts';
const ITEMS_SUBCOLLECTION = 'items';

const CartContentPlaceholder = () => (
  <View style={styles.cartContentPlaceholder}>
    <Icon name="image" size={40} color="#B0D88E" />
  </View>
);

// Componente de Detalhes do Cartão (AJUSTADO PARA PAGAMENTO À VISTA)
const CardDetails = ({ onClose, cardData, setCardData, showToast, setInstallmentsSelected }) => {
  
  const handleConfirmData = () => {
      // 1. Simula a validação local dos campos (opcional, mas boa prática)
      const numberValid = cardData.number.replace(/\s/g, '').length >= 13;
      const holderValid = cardData.holder.length >= 3;

      if (!numberValid || !holderValid) {
          showToast("Preencha o número e o nome do titular.", 'warning');
          return;
      }
      
      // 2. Marca o método como pronto
      showToast("Pagamento à vista confirmado! Pronto para finalizar.", 'success');
      setInstallmentsSelected(true); 
      
      // 3. FECHA O PAINEL IMEDIATAMENTE (Comportamento desejado)
      onClose(); 
  };

  return (
    <View style={styles.detailsContainer}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Icon name="close" size={24} color="#999" />
      </TouchableOpacity>
      <TextInput 
        style={styles.inputDetails} 
        placeholder="Número do Cartão" 
        placeholderTextColor="#666" 
        keyboardType="numeric"
        maxLength={19}
        onChangeText={(text) => setCardData(prev => ({ ...prev, number: text }))}
        value={cardData.number}
      />
      <TextInput 
        style={styles.inputDetails} 
        placeholder="Nome do Titular" 
        placeholderTextColor="#666" 
        onChangeText={(text) => setCardData(prev => ({ ...prev, holder: text }))}
        value={cardData.holder}
      />
      <View style={styles.row}>
        <TextInput 
          style={[styles.inputDetails, styles.inputHalf]} 
          placeholder="Validade (MM/AA)" 
          placeholderTextColor="#666" 
          keyboardType="numeric"
          maxLength={5}
          onChangeText={(text) => setCardData(prev => ({ ...prev, expiry: text }))}
          value={cardData.expiry}
        />
        <TextInput 
          style={[styles.inputDetails, styles.inputHalf]} 
          placeholder="CVV" 
          placeholderTextColor="#666" 
          keyboardType="numeric"
          maxLength={4}
          onChangeText={(text) => setCardData(prev => ({ ...prev, cvv: text }))}
          value={cardData.cvv}
        />
      </View>
      <TouchableOpacity style={styles.parcelasButton} onPress={handleConfirmData}>
          <Text style={styles.parcelasText}>CONFIRMAR DADOS (À VISTA)</Text>
      </TouchableOpacity>
    </View>
  );
};

const PixDetails = ({ onClose, proofAdded, setProofAdded, showToast }) => {

  const handleUploadProof = () => {
    showToast("Comprovante anexado com sucesso. Você pode finalizar!", 'success');
    setProofAdded(true);
  };

  return (
    <View style={[styles.detailsContainer, styles.pixContainer]}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Icon name="close" size={24} color="#999" />
      </TouchableOpacity>
      
      <Text style={styles.pixTitle}>Chave PIX (CNPJ: 00.000.000/0001-00)</Text>
      <View style={[styles.pixKeyBox, proofAdded && styles.pixKeyBoxDisabled]}>
          <Text style={[styles.pixKeyText, proofAdded && styles.pixKeyTextDisabled]}>A8C8C80A-00A0-4C00-00A0-B00C00000000</Text>
      </View>
      
      <TouchableOpacity style={styles.copyButton} disabled={proofAdded}>
        <Icon name="content-copy" size={20} color="#fff" />
        <Text style={styles.copyButtonText}>COPIAR CHAVE</Text>
      </TouchableOpacity>
      
      <View style={styles.proofSection}>
        <Text style={styles.proofLabel}>COMPROVANTE DE PAGAMENTO</Text>
        <TouchableOpacity 
          style={[styles.uploadButton, proofAdded && styles.uploadButtonSuccess]} 
          onPress={handleUploadProof}
          disabled={proofAdded} 
        >
          <Icon 
            name={proofAdded ? "check-circle" : "cloud-upload"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.uploadButtonText}>
            {proofAdded ? "ANEXADO" : "ADICIONAR COMPROVANTE"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const SideGradient = ({ style }) => (
  <LinearGradient colors={['#FF9800', '#FFB74D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={style} />
);

// Fim dos componentes UI

const CartScreen = () => {
  const { user } = useAuth(); 
  
  // Estados do Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true); 
  
  const [paymentMethod, setPaymentMethod] = useState('CARTAO');
  const [cardDetailsVisible, setCardDetailsVisible] = useState(true);
  const [pixDetailsVisible, setPixDetailsVisible] = useState(false);
  
  const [zipCode, setZipCode] = useState('');
  const [shippingCost, setShippingCost] = useState(0); 

  const [cardData, setCardData] = useState({
    number: '', holder: '', expiry: '', cvv: '',
  });
  const [pixProofAdded, setPixProofAdded] = useState(false);
  
  const [installmentsSelected, setInstallmentsSelected] = useState(false); 

  const unsubscribeRef = useRef(null); 

  // --- 1. FUNÇÃO DE CARREGAMENTO AGORA É UM LISTENER EM TEMPO REAL ---
  const setupCartListener = useCallback(() => {
    if (unsubscribeRef.current) {
        unsubscribeRef.current(); 
    }
    
    if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
    }

    setLoading(true);
    
    const cartItemsRef = collection(db, CARTS_COLLECTION, user.uid, ITEMS_SUBCOLLECTION);
    const q = query(cartItemsRef);

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
        try {
            const items = snapshot.docs.map(doc => ({
                id: doc.id, 
                ...doc.data(),
            }));
            setCartItems(items);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao processar snapshot do Firestore:", error);
            showToast("Erro ao carregar dados do carrinho.", 'error');
            setLoading(false);
        }
    }, (error) => {
        console.error("Erro no listener do Firestore:", error);
        showToast("Conexão com o carrinho falhou.", 'error');
        setLoading(false);
    });

    return unsubscribeRef.current;
  }, [user]);

  // UseFocusEffect para iniciar e parar o listener
  useFocusEffect(
    useCallback(() => {
      // Reseta os estados de pagamento/frete ao focar na tela
      setInstallmentsSelected(false);
      setShippingCost(0);
      
      // Abre o painel do cartão por padrão ao focar, se o método for cartão
      if (paymentMethod === 'CARTAO') {
          setCardDetailsVisible(true);
      }

      const unsubscribe = setupCartListener();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [setupCartListener, paymentMethod]) 
  );

  // --- 2. FUNÇÕES DE MANIPULAÇÃO USAM FIRESTORE (Doc ID = item.productId) ---
  const updateQuantity = async (itemId, change) => {
    if (!user) return showToast("Usuário não autenticado.", 'error');
    
    const currentItem = cartItems.find(item => item.id === itemId);
    if (!currentItem) return;

    const newQuantity = Math.max(1, (currentItem.quantity || 1) + change);
    
    try {
        const itemDocRef = doc(db, CARTS_COLLECTION, user.uid, ITEMS_SUBCOLLECTION, itemId);
        
        await setDoc(itemDocRef, { 
            ...currentItem, 
            quantity: newQuantity 
        }, { merge: true }); 
        
    } catch (err) {
      console.error('Erro ao atualizar quantidade no Firestore', err);
      showToast('Erro ao atualizar a quantidade. Tente novamente.', 'error');
    }
  };

  const removeItem = async (itemId) => {
    if (!user) return showToast("Usuário não autenticado.", 'error');
    
    try {
      const itemDocRef = doc(db, CARTS_COLLECTION, user.uid, ITEMS_SUBCOLLECTION, itemId);
      await deleteDoc(itemDocRef);
      showToast('Item removido do carrinho.', 'info');
    } catch (err) {
      console.error('Erro ao remover item do Firestore', err);
      showToast('Erro ao remover item. Tente novamente.', 'error');
    }
  };
  
  // --- 3. FUNÇÃO DE FINALIZAÇÃO (Limpa Subcoleção) ---
  const finalizeOrder = async (orderData) => {
    if (!user) return showToast("Usuário não autenticado.", 'error');

    // 1. Simulação de salvar o pedido na coleção 'orders'
    try {
        const ordersRef = collection(db, 'orders'); 
        await setDoc(doc(ordersRef), {
            userId: user.uid,
            total: orderData.total,
            items: orderData.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
            paymentMethod: orderData.paymentMethod,
            timestamp: new Date(),
            status: 'Processing',
        });
        
    } catch (e) {
        console.warn('Erro ao simular adição do pedido na coleção "orders". Continuando com a limpeza do carrinho.', e);
    }
    
    // 2. LIMPAR O CARRINHO (Usando writeBatch CORRETAMENTE)
    try {
        const batch = writeBatch(db); 
        cartItems.forEach(item => {
            const itemDocRef = doc(db, CARTS_COLLECTION, user.uid, ITEMS_SUBCOLLECTION, item.id);
            batch.delete(itemDocRef);
        });
        await batch.commit();

        setCartItems([]); 
        setShippingCost(0);
        setPixProofAdded(false);
        setInstallmentsSelected(false); 
        return true;
    } catch (err) {
        console.error('Erro ao limpar o carrinho (batch delete):', err);
        showToast('Erro ao limpar o carrinho após a finalização.', 'error');
        return false;
    }
  }


  // --- RESTO DA LÓGICA DE UI E VALIDAÇÃO ---

  const calculateShipping = () => {
    const cleanZip = zipCode.replace(/[^0-9]/g, '');
    let cost = 0;

    if (cleanZip.length === 8) {
        // Frete entre R$ 2.00 e R$ 10.00
        const MIN_COST = 2;
        const MAX_COST = 10;
        const randomCost = Math.random() * (MAX_COST - MIN_COST) + MIN_COST;
        cost = parseFloat(randomCost.toFixed(2));
        
        // Mantém 10% de chance de dar frete grátis
        if (Math.random() < 0.1) {
            cost = 0;
            showToast('Frete Grátis! Você ganhou frete grátis!', 'success');
        } else {
             showToast(`Frete simulado de R$ ${cost.toFixed(2).replace('.', ',')} calculado.`, 'info');
        }
    } else {
        showToast('Digite um CEP válido com 8 dígitos para calcular o frete.', 'warning');
        cost = 0;
    }
    setShippingCost(cost);
  };
  
  const subtotal = cartItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const total = subtotal + shippingCost; 

  const validateCardData = () => {
    const { number, holder, expiry, cvv } = cardData;
    
    if (number.replace(/\s/g, '').length < 13 || number.replace(/\s/g, '').length > 19) {
        return { valid: false, message: 'O número do cartão parece inválido.' };
    }
    if (holder.length < 3) {
        return { valid: false, message: 'Nome do titular muito curto.' };
    }
    if (expiry.length !== 5 || !expiry.includes('/')) {
        return { valid: false, message: 'Formato de validade inválido (MM/AA).' };
    }
    if (cvv.length < 3 || cvv.length > 4) {
        return { valid: false, message: 'CVV inválido.' };
    }
    return { valid: true, message: 'Dados do cartão válidos.' };
  };

  const handlePaymentSelect = (method) => {
    setPixProofAdded(false); 
    setInstallmentsSelected(false); 
    
    // CORRIGIDO: Sempre abrir o painel se for o método selecionado
    if (method === 'CARTAO') {
      const shouldToggle = paymentMethod === 'CARTAO' && cardDetailsVisible;
      setCardDetailsVisible(!shouldToggle); 
      setPixDetailsVisible(false);
      setPaymentMethod('CARTAO');
    } else {
      const shouldToggle = paymentMethod === 'PIX' && pixDetailsVisible;
      setPixDetailsVisible(!shouldToggle); 
      setCardDetailsVisible(false);
      setPaymentMethod('PIX');
    }
  };

  const handleCloseDetails = () => {
    setCardDetailsVisible(false);
    setPixDetailsVisible(false);
  };
  
  // --- FUNÇÃO DE FINALIZAÇÃO QUE CHAMA O FIRESTORE ---
  const handleFinalize = async () => {
    if (!user) {
        showToast('Faça login para finalizar a compra.', 'error');
        return;
    }

    if (!cartItems.length) {
      showToast('Carrinho vazio. Adicione itens antes de finalizar a compra.', 'warning');
      return;
    }

    // 1. Validação Frete
    if (zipCode.length < 8 || shippingCost === 0) {
        showToast('Calcule o frete para continuar a compra.', 'warning');
        return;
    }

    // 2. Validação Cartão (AGORA USA O ESTADO DE FECHAMENTO PARA VALIDAR)
    if (paymentMethod === 'CARTAO') {
        // Se o painel estiver ABERTO, significa que o usuário não confirmou
        if (cardDetailsVisible) {
            showToast('Feche o painel de detalhes do cartão após inserir os dados.', 'warning');
            return;
        }

        const validationResult = validateCardData();
        if (!validationResult.valid) {
            showToast(`Erro no Cartão: ${validationResult.message}`, 'error');
            return;
        }
        
        // **NÃO PRECISA MAIS DE check de installmentsSelected AQUI, pois a confirmação já fechou o painel.**
        // O fluxo agora é: Preenche -> Clica CONFIRMAR DADOS (que fecha) -> Clica FINALIZAR.
    } 
    // 3. Validação PIX
    else if (paymentMethod === 'PIX') {
        if (!pixProofAdded) {
            showToast('Você deve anexar o comprovante de pagamento PIX.', 'warning');
            return;
        }
    }

    const orderData = {
        total: total,
        items: cartItems,
        paymentMethod: paymentMethod,
    };
    
    showToast('Finalizando pedido...', 'info');

    const success = await finalizeOrder(orderData); 
    
    if (success) {
        showToast(`COMPRA CONCLUÍDA! Pedido de R$ ${total.toFixed(2).replace('.', ',')} finalizado.`, 'success');
    } else {
        showToast('Falha ao concluir a compra. Tente novamente.', 'error');
    }
  };
  // -------------------------------------------------------------

  if (loading && user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 10, color: '#666' }}>Carregando carrinho...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ... [Header e UI] ... */}
      <View style={styles.header}>
        <Image source={require('../../assets/images/logo-branca.png')} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#999" />
          <TextInput style={styles.searchInput} placeholder="Pesquisar..." placeholderTextColor="#999" />
        </View>
      </View>

      <View style={styles.screenContent}>
        <SideGradient style={styles.leftGradient} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.sectionHeader}>
            <LinearGradient colors={['#FF9800', '#FFB74D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cartIconGradient}>
              <Icon name="shopping-cart" size={20} color="#fff" />
            </LinearGradient>
          </View>

          {/* Renderização de Itens */}
          {Array.isArray(cartItems) && cartItems.length > 0 ? (
            cartItems.map((item) => (
              // Usando item.id (ID do Firestore) como chave
              <View key={item.id} style={styles.card}> 
                <CartContentPlaceholder />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.quantityRemoveContainer}>
                    <LinearGradient colors={['#FFB74D', '#FF9800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.quantityGradient}>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>-</Text></TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>+</Text></TouchableOpacity>
                    </LinearGradient>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}><Icon name="delete-outline" size={26} color="#999" /></TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCartContainer}>
                <Icon name="remove-shopping-cart" size={50} color="#ccc" />
                <Text style={styles.emptyCartText}>Seu carrinho está vazio.</Text>
            </View>
          )}
          
          {/* Subtotal e Frete */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>SUBTOTAL</Text>
            <Text style={styles.totalValue}>{`R$ ${subtotal.toFixed(2).replace('.', ',')}`}</Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>FRETE</Text>
            <Text style={[styles.totalValue, { color: shippingCost === 0 && zipCode.length === 8 ? '#38764B' : '#999' }]}>
                {shippingCost === 0 && zipCode.length === 8 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
            </Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>TOTAL FINAL</Text>
            <View style={styles.totalValueContainer}>
              <TouchableOpacity style={styles.totalButton}><Text style={styles.totalButtonText}>R$ {total.toFixed(2).replace('.', ',')}</Text></TouchableOpacity>
            </View>
          </View>


          <Text style={styles.label}>CUPOM</Text>
          <TextInput style={styles.input} placeholder="Digite o cupom" placeholderTextColor="#999" />

          <Text style={styles.label}>PAGAMENTO</Text>
          <View style={styles.paymentContainer}>
            <TouchableOpacity style={styles.paymentButton} onPress={() => handlePaymentSelect('CARTAO')}>
              {paymentMethod === 'CARTAO' ? (
                <LinearGradient colors={['#FF9800', '#FFB74D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.paymentInnerWrapper, styles.cardActiveFill]}>
                  <Text style={styles.pixText}>CARTÃO</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.paymentInnerWrapper, styles.cardInactiveOutline]}><Text style={styles.paymentText}>CARTÃO</Text></View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentButton} onPress={() => handlePaymentSelect('PIX')}>
              {paymentMethod === 'PIX' ? (
                <LinearGradient colors={['#FF9800', '#FFB74D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.paymentInnerWrapper, styles.cardActiveFill]}>
                  <Text style={styles.pixText}>PIX</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.paymentInnerWrapper, styles.cardInactiveOutline]}><Text style={styles.paymentText}>PIX</Text></View>
              )}
            </TouchableOpacity>
          </View>

          {paymentMethod === 'CARTAO' && cardDetailsVisible && (
            <CardDetails 
                onClose={handleCloseDetails} 
                cardData={cardData} 
                setCardData={setCardData} 
                showToast={showToast}
                setInstallmentsSelected={setInstallmentsSelected} // Passando o setter de parcelas
            />
          )}
          {paymentMethod === 'PIX' && pixDetailsVisible && (
            <PixDetails 
              onClose={handleCloseDetails} 
              proofAdded={pixProofAdded} 
              setProofAdded={setPixProofAdded} 
              showToast={showToast}
            />
          )}

          <Text style={styles.label}>ENTREGA</Text>
          <View style={styles.shippingInputContainer}>
            <TextInput 
                style={styles.shippingInput} 
                placeholder="Digite o CEP (apenas números)" 
                placeholderTextColor="#999" 
                keyboardType="numeric"
                maxLength={8}
                onChangeText={setZipCode}
                value={zipCode}
            />
            <TouchableOpacity style={styles.shippingButton} onPress={calculateShipping}>
                <Icon name="local-shipping" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* O BOTÃO FINAL CHAMA handleFinalize */}
          <TouchableOpacity onPress={handleFinalize} style={styles.finalButton} disabled={!cartItems.length}>
            <LinearGradient colors={['#FFB74D', '#FF9800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.finalGradient}>
              <Text style={styles.finalButtonText}>FINALIZAR COMPRA</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
        <SideGradient style={styles.rightGradient} />
      </View>
      
      {/* --- TOAST VISUAL --- */}
      <View style={styles.toastPlaceholder}>
        {toastVisible && (
          <View style={[styles.toastBase, styles[toastType]]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
            <TouchableOpacity onPress={() => setToastVisible(false)} style={styles.toastCloseButton}>
              <Text style={styles.toastCloseText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#38764B', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  logoImage: { width: 120, height: 50, marginLeft: -10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 50, paddingHorizontal: 15, width: '65%', height: 40, elevation: 3 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#333', paddingVertical: 0 },
  screenContent: { flex: 1, flexDirection: 'row', position: 'relative' },
  content: { flex: 1, paddingHorizontal: 25, zIndex: 1, backgroundColor: 'transparent' },
  scrollContentContainer: { paddingBottom: 50 },
  leftGradient: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 25, transform: [{ translateX: -10 }] },
  rightGradient: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 25, transform: [{ translateX: 10 }] },
  sectionHeader: { marginTop: 20, marginBottom: 10, alignSelf: 'flex-start' },
  cartIconGradient: { padding: 8, borderRadius: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 15, padding: 10, marginBottom: 15, elevation: 2 },
  cartContentPlaceholder: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#E6F4E6', borderColor: '#B0D88E', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemName: { fontWeight: 'bold', color: '#333', marginBottom: 5 },
  quantityRemoveContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  quantityGradient: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, overflow: 'hidden', padding: 2, backgroundColor: '#FF9800' },
  quantityButton: { backgroundColor: 'transparent', width: 25, height: 25, justifyContent: 'center', alignItems: 'center' },
  quantityButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginHorizontal: 8 },
  removeButton: { padding: 5 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValueContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#999' },
  totalButton: { backgroundColor: '#FF9800', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  totalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#fff' },
  paymentContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 5, marginBottom: 10 },
  paymentButton: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'transparent', overflow: 'hidden' },
  paymentInnerWrapper: { width: '100%', height: '100%', position: 'absolute', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cardInactiveOutline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FF9800' },
  paymentText: { color: '#FF9800', fontWeight: 'bold', fontSize: 16 },
  cardActiveFill: {},
  pixText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  detailsContainer: { backgroundColor: '#f8f8f8', borderRadius: 8, padding: 15, marginBottom: 15, marginTop: 5, borderWidth: 1, borderColor: '#eee', position: 'relative' },
  closeButton: { position: 'absolute', top: 5, right: 5, zIndex: 10, padding: 5 },
  inputDetails: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#333', backgroundColor: '#fff', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputHalf: { width: '48%' },
  parcelasButton: { backgroundColor: '#ccc', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  parcelasText: { color: '#333', fontWeight: 'bold' },
  pixContainer: { alignItems: 'center' },
  pixTitle: { fontWeight: 'bold', color: '#333', marginBottom: 10 },
  pixKeyBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, width: '100%', marginBottom: 15, alignItems: 'center' },
  pixKeyText: { color: '#666', fontSize: 14, textAlign: 'center' },
  copyButton: { backgroundColor: '#38764B', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, gap: 5 },
  copyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  finalButton: { marginTop: 30, marginBottom: 50, borderRadius: 10, overflow: 'hidden' },
  finalGradient: { paddingVertical: 15, alignItems: 'center' },
  finalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyCartContainer: { alignItems: 'center', padding: 40, marginTop: 30, backgroundColor: '#f9f9f9', borderRadius: 10 },
  emptyCartText: { marginTop: 10, fontSize: 16, color: '#999' },
  shippingInputContainer: { flexDirection: 'row', gap: 10 },
  shippingInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#333', backgroundColor: '#fff' },
  shippingButton: { backgroundColor: '#38764B', padding: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  proofSection: { width: '100%', marginTop: 20, alignItems: 'center' },
  proofLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  uploadButton: { 
    backgroundColor: '#FF9800', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    gap: 5 
  },
  uploadButtonSuccess: { 
    backgroundColor: '#38764B', 
  },
  uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  pixKeyBoxDisabled: { borderColor: '#B0D88E', backgroundColor: '#E6F4E6' },
  pixKeyTextDisabled: { color: '#999' },
  
  // --- ESTILOS BÁSICOS DO TOAST ---
  toastPlaceholder: {
    position: 'absolute',
    top: 50, 
    width: '90%',
    alignSelf: 'center',
    zIndex: 999,
  },
  toastBase: {
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastText: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  toastCloseButton: {
    paddingLeft: 10,
  },
  toastCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  success: { backgroundColor: '#38764B' }, 
  error: { backgroundColor: '#C70039' },
  warning: { backgroundColor: '#FFC300' },
  info: { backgroundColor: '#1E90FF' },
  // ----------------------------------
});

export default CartScreen;