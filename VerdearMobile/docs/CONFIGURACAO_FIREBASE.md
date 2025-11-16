# Configuração do Firebase - VerdearMobile

Este guia explica como configurar o Firebase para que todas as funcionalidades do app funcionem corretamente.

## ℹ️ Sobre Armazenamento de Imagens

**IMPORTANTE**: Este app armazena fotos de perfil em **base64** diretamente no Firestore, **não** no Firebase Storage.

**Por quê?**
- ✅ Menos configuração necessária
- ✅ Não precisa configurar regras do Storage
- ✅ Imagens sempre disponíveis junto com os dados
- ✅ Funciona automaticamente em todas as plataformas

**Limitações**:
- As imagens são comprimidas para ~800px de largura
- Tamanho máximo de 1MB (limite do Firestore por campo)

---

## 🔧 Configurações Obrigatórias

### 1️⃣ Firestore Database Rules

**Como configurar**:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `verdear-mobile`
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Rules** (Regras)
5. Cole o código abaixo e clique em **Publish** (Publicar)

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

    // Chats: usuários podem ler/escrever apenas conversas que participam
    match /chats/{chatId} {
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null &&
                       request.auth.uid in request.resource.data.participants;
      allow update: if request.auth != null &&
                       request.auth.uid in resource.data.participants;
      allow delete: if false;
    }

    // Messages: usuários podem ler/escrever mensagens dos chats que participam
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null &&
                     request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow create: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow update, delete: if false;
    }
  }
}
```

---

### 2️⃣ Authentication - Email Templates

**⚠️ NECESSÁRIO para emails de redefinição de senha funcionarem**

**Como configurar**:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `verdear-mobile`
3. No menu lateral, clique em **Authentication** (Autenticação)
4. Clique na aba **Templates** (Modelos)
5. Clique em **Password reset** (Redefinição de senha)
6. Configure o template:

**Assunto recomendado**:
```
Redefinir senha - Verdear
```

**Corpo do email recomendado**:
```
Olá,

Recebemos uma solicitação para redefinir a senha da sua conta Verdear.

Para criar uma nova senha, clique no link abaixo:
%LINK%

Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma.

Este link expira em 1 hora.

Atenciosamente,
Equipe Verdear
```

7. Clique em **Salvar**

**Observações importantes**:
- ⚠️ Emails podem ir para a pasta de **SPAM** - sempre peça ao usuário para verificar
- 📧 O remetente padrão é `noreply@verdear-mobile.firebaseapp.com`
- ⏰ O link expira em 1 hora
- 🌐 Para personalizar o domínio, configure SMTP customizado no Firebase

**Testar o email**:
1. Faça login no app
2. Vá em **Perfil** > **Alterar cadastro**
3. Clique em **Alterar senha**
4. Verifique sua caixa de entrada (e **pasta de spam!**)
5. O link expira em 1 hora

---

## 🚀 Verificação Final

### Checklist de Configuração

- [ ] **Firestore Rules** configuradas e publicadas
- [ ] **Email Template** de password reset configurado
- [ ] Testou upload de foto de perfil ✅
- [ ] Testou email de redefinição de senha 📧
- [ ] Verificou pasta de spam do email

### Testes Funcionais

1. **Upload de Foto**:
   - Login → Perfil → Alterar cadastro → Foto
   - ✅ Deve fazer upload sem erros

2. **Redefinição de Senha**:
   - Login → Perfil → Alterar cadastro → Alterar senha
   - ✅ Deve receber email (verifique spam)

3. **Chat**:
   - Login → Chat → Nova conversa
   - ✅ Deve criar conversa sem erros

---

## 🐛 Resolução de Problemas

### Problema: Email de redefinição não chega

**Possíveis causas**:

1. **Email está no spam** (mais comum)
   - ✅ Verifique a pasta de spam/lixo eletrônico

2. **Template não configurado**
   - ✅ Configure o template conforme seção 3️⃣

3. **Email incorreto**
   - ✅ Verifique se o email no Firebase Auth é o mesmo usado no login

4. **Bloqueio de firewall/provedor**
   - ✅ Alguns provedores bloqueiam emails de `firebaseapp.com`
   - ✅ Teste com outro email (Gmail geralmente funciona)

### Problema: Erro ao fazer upload de foto

**Possíveis causas**:

1. **Imagem muito grande**
   - ✅ A imagem é comprimida automaticamente, mas se for gigantesca pode falhar
   - ✅ Tente com uma imagem menor (< 10MB original)

2. **Erro ao converter para base64**
   - ✅ Verifique os logs do console
   - ✅ Tente com outra foto

3. **Limite do Firestore excedido**
   - ✅ Firestore tem limite de 1MB por campo
   - ✅ A imagem é comprimida progressivamente, mas pode falhar em casos extremos

### Problema: Upload lento

**Possíveis causas**:

1. **Processamento de imagem grande**
   - ✅ Compressão e conversão para base64 pode demorar em imagens grandes
   - ✅ Use fotos menores (< 5MB original)

2. **Conexão lenta ao Firestore**
   - ✅ Base64 strings são grandes (~1.3x o tamanho original)
   - ✅ Teste com WiFi ao invés de 3G/4G

---

## 📚 Referências

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Auth Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
- [Base64 Image Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)

---

## 💡 Dicas de Produção

### Antes de Publicar o App

1. **Revise as regras de segurança**
   - Teste com diferentes usuários
   - Verifique se ninguém consegue acessar dados de outros

2. **Configure domínio customizado para emails**
   - Ao invés de `noreply@verdear-mobile.firebaseapp.com`
   - Use `noreply@verdear.com.br` (mais profissional)

3. **Monitore uso do Firestore**
   - Firebase Console > Firestore > Usage
   - Imagens base64 aumentam o uso de armazenamento
   - Configure alertas de quota

4. **Backup de dados**
   - Configure exports automáticos do Firestore
   - Implemente política de backup
   - Considere migrar para Storage se tiver muitas imagens

5. **Otimização de Imagens**
   - Para apps com muitos usuários, considere usar Firebase Storage
   - Base64 no Firestore é ideal para protótipos e apps pequenos
   - Para escala, Storage é mais eficiente

---

**Última atualização**: 2025-01-16
