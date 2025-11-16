# Modelos de Dados Firestore - VerdearMobile

Este documento descreve a estrutura das coleções no Firestore.

## Collection: `users`

Armazena informações dos usuários cadastrados.

**Caminho**: `/users/{uid}`

```typescript
{
  email: string,              // Email do usuário
  name: string,               // Nome completo
  cpfCnpj: string,           // CPF ou CNPJ (apenas números)
  phone: string,              // Telefone (apenas números)
  userType: 'Vendedor' | 'Comprador',  // Tipo de usuário
  avatar: string,             // Foto de perfil em base64 (data:image/jpeg;base64,...)
  createdAt: string,          // Data de criação (ISO string)

  // Campos de endereço (opcionais)
  address?: string,           // Rua/Avenida
  addressNumber?: string,     // Número
  complement?: string,        // Complemento (apto, bloco, etc)
  city?: string,              // Cidade
  state?: string,             // Estado (sigla: SP, RJ, etc)
  cep?: string,               // CEP (apenas números)

  // Campos adicionais
  bio?: string,               // Descrição/biografia do usuário

  // Apenas para vendedores
  bankAccount?: {
    bank: string,             // Nome do banco
    agency: string,           // Agência
    account: string,          // Número da conta
    accountType: 'Corrente' | 'Poupança',  // Tipo de conta
  }
}
```

**Exemplo - Comprador**:
```json
{
  "email": "joao@exemplo.com",
  "name": "João Silva",
  "cpfCnpj": "12345678909",
  "phone": "11987654321",
  "userType": "Comprador",
  "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "address": "Rua das Flores",
  "addressNumber": "123",
  "complement": "Apto 45",
  "city": "São Paulo",
  "state": "SP",
  "cep": "01234567",
  "bio": "Amante de produtos orgânicos e sustentabilidade"
}
```

**Exemplo - Vendedor**:
```json
{
  "email": "maria@fazenda.com",
  "name": "Maria Agricultora",
  "cpfCnpj": "12345678000190",
  "phone": "11912345678",
  "userType": "Vendedor",
  "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "address": "Estrada Rural KM 15",
  "addressNumber": "S/N",
  "city": "Ibiúna",
  "state": "SP",
  "cep": "18150000",
  "bio": "Produtora de orgânicos há 10 anos",
  "bankAccount": {
    "bank": "Banco do Brasil",
    "agency": "1234-5",
    "account": "67890-1",
    "accountType": "Corrente"
  }
}
```

---

## Collection: `purchases`

Armazena o histórico de compras dos usuários.

**Caminho**: `/purchases/{purchaseId}`

```typescript
{
  userId: string,             // ID do usuário que fez a compra
  productId: string,          // ID do produto comprado
  productName: string,        // Nome do produto
  productImage: string,       // URL da imagem do produto
  quantity: number,           // Quantidade comprada
  price: number,              // Preço total (quantidade * preço unitário)
  sellerId: string,           // ID do vendedor
  status: 'pending' | 'completed' | 'cancelled',  // Status da compra
  createdAt: Timestamp,       // Data da compra (Firebase Timestamp)
}
```

**Exemplo**:
```json
{
  "userId": "abc123",
  "productId": "prod456",
  "productName": "Tomate Orgânico 1kg",
  "productImage": "https://i.imgur.com/J8iL34j.png",
  "quantity": 3,
  "price": 24.90,
  "sellerId": "vendor789",
  "status": "completed",
  "createdAt": "Firebase Timestamp"
}
```

---

## Collection: `reviews`

Armazena as avaliações feitas pelos usuários.

**Caminho**: `/reviews/{reviewId}`

```typescript
{
  userId: string,             // ID do usuário que fez a avaliação
  productId: string,          // ID do produto avaliado
  productName: string,        // Nome do produto
  productImage: string,       // URL da imagem do produto
  rating: number,             // Nota de 1 a 5
  comment: string,            // Comentário da avaliação
  sellerId: string,           // ID do vendedor
  createdAt: Timestamp,       // Data da avaliação (Firebase Timestamp)
}
```

**Exemplo**:
```json
{
  "userId": "abc123",
  "productId": "prod456",
  "productName": "Tomate Orgânico 1kg",
  "productImage": "https://i.imgur.com/J8iL34j.png",
  "rating": 5,
  "comment": "Produto de excelente qualidade! Chegou fresquinho.",
  "sellerId": "vendor789",
  "createdAt": "Firebase Timestamp"
}
```

---

## Collection: `products`

Armazena os produtos cadastrados pelos vendedores.

**Caminho**: `/products/{productId}`

```typescript
{
  sellerId: string,           // ID do vendedor
  name: string,               // Nome do produto
  description: string,        // Descrição do produto
  price: number,              // Preço unitário
  image: string,              // URL da imagem do produto
  category: string,           // Categoria (ex: 'Verduras', 'Frutas', 'Legumes')
  stock: number,              // Quantidade em estoque
  unit: string,               // Unidade (ex: 'kg', 'un', 'maço')
  status: 'active' | 'inactive',  // Status do produto
  createdAt: Timestamp,       // Data de cadastro
  updatedAt: Timestamp,       // Data da última atualização
}
```

**Exemplo**:
```json
{
  "sellerId": "vendor789",
  "name": "Tomate Orgânico",
  "description": "Tomate orgânico cultivado sem agrotóxicos",
  "price": 8.90,
  "image": "https://i.imgur.com/J8iL34j.png",
  "category": "Legumes",
  "stock": 50,
  "unit": "kg",
  "status": "active",
  "createdAt": "Firebase Timestamp",
  "updatedAt": "Firebase Timestamp"
}
```

---

## Como Popular Dados de Teste

Para testar a funcionalidade de histórico de compras, você pode criar documentos manualmente no Firebase Console ou usar o código abaixo:

### Criar Compra de Teste
```javascript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const createTestPurchase = async (userId) => {
  await addDoc(collection(db, 'purchases'), {
    userId: userId,
    productId: 'prod001',
    productName: 'Tomate Orgânico 1kg',
    productImage: 'https://i.imgur.com/J8iL34j.png',
    quantity: 2,
    price: 17.80,
    sellerId: 'vendor123',
    status: 'completed',
    createdAt: serverTimestamp(),
  });
};
```

### Criar Avaliação de Teste
```javascript
const createTestReview = async (userId) => {
  await addDoc(collection(db, 'reviews'), {
    userId: userId,
    productId: 'prod001',
    productName: 'Tomate Orgânico 1kg',
    productImage: 'https://i.imgur.com/J8iL34j.png',
    rating: 5,
    comment: 'Produto excelente! Recomendo.',
    sellerId: 'vendor123',
    createdAt: serverTimestamp(),
  });
};
```

---

## Regras de Segurança do Firestore (Recomendadas)

**⚠️ IMPORTANTE**: Você deve configurar estas regras no Firebase Console para o app funcionar corretamente.

**Como Configurar**:
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `verdear-mobile`
3. Vá em **Firestore Database** > **Regras**
4. Cole o código abaixo e publique

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: apenas o próprio usuário pode ler/escrever seus dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Purchases: usuário pode ler apenas suas compras
    match /purchases/{purchaseId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update, delete: if false; // Não permite alterar/deletar compras
    }

    // Reviews: usuário pode ler e escrever apenas suas avaliações
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               resource.data.userId == request.auth.uid;
    }

    // Products: todos podem ler, apenas vendedores podem escrever seus produtos
    match /products/{productId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              resource.data.sellerId == request.auth.uid;
    }
  }
}
```

---

## Armazenamento de Imagens

**ℹ️ IMPORTANTE**: As fotos de perfil são armazenadas em **base64** diretamente no Firestore, não no Firebase Storage.

**Vantagens**:
- ✅ Não precisa configurar Firebase Storage
- ✅ Menos complexidade de configuração
- ✅ Imagens sempre disponíveis junto com os dados do usuário
- ✅ Funciona automaticamente em todas as plataformas

**Limitações**:
- ⚠️ Firestore tem limite de 1MB por campo
- ⚠️ A imagem é comprimida automaticamente para ~800px de largura
- ⚠️ Qualidade JPEG reduzida progressivamente até caber em 2MB

**Como Funciona**:
1. Usuário seleciona foto da galeria ou câmera
2. Imagem é redimensionada para largura máxima de 800px
3. Comprimida progressivamente (qualidade 80% → 30%)
4. Convertida para base64
5. Salva no campo `avatar` do documento do usuário no Firestore

**Formato**:
```javascript
avatar: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
```

**Exibição**:
```jsx
<Image source={{ uri: userData.avatar }} />
```

React Native renderiza strings base64 automaticamente quando usadas como `uri`.

---

## Configuração de Email (Password Reset)

**⚠️ NECESSÁRIO**: Para que emails de redefinição de senha funcionem.

**Como Configurar**:
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `verdear-mobile`
3. Vá em **Authentication** > **Templates** (aba superior)
4. Clique em **Password reset** (Redefinição de senha)
5. Configure o template:

**Template Recomendado**:
```
Assunto: Redefinir senha - Verdear

Corpo:
Olá,

Recebemos uma solicitação para redefinir a senha da sua conta Verdear.

Para criar uma nova senha, clique no link abaixo:
%LINK%

Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma.

Este link expira em 1 hora.

Atenciosamente,
Equipe Verdear
```

6. Clique em **Salvar**

**Observações**:
- Emails podem ir para a pasta de **SPAM** - peça ao usuário para verificar
- O remetente padrão é `noreply@verdear-mobile.firebaseapp.com`
- Para personalizar o domínio, configure SMTP customizado no Firebase

**Testar Email**:
1. Faça login no app
2. Vá em Perfil > Alterar cadastro
3. Clique em "Alterar senha"
4. Verifique sua caixa de entrada (e spam!)
5. O link expira em 1 hora
