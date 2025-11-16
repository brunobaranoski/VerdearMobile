import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadProfileImage } from '../../utils/imageUpload';

// Tipos
interface BankAccount {
  bank: string;
  agency: string;
  account: string;
  accountType: 'Corrente' | 'Poupança';
}

interface UserData {
  uid: string;
  email: string;
  name?: string;
  avatar?: string;
  cpfCnpj?: string;
  phone?: string;
  userType?: 'Vendedor' | 'Comprador';
  // Campos de endereço
  address?: string;
  addressNumber?: string;
  complement?: string;
  city?: string;
  state?: string;
  cep?: string;
  // Campos adicionais
  bio?: string;
  bankAccount?: BankAccount;
}

interface AuthContextData {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userData: {
      name: string;
      cpfCnpj?: string;
      phone?: string;
      userType?: 'Vendedor' | 'Comprador';
    }
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserData>) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<string>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitora estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Busca dados adicionais do Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: data.name,
              avatar: data.avatar,
              cpfCnpj: data.cpfCnpj,
              phone: data.phone,
              userType: data.userType,
            });
          } else {
            // Dados básicos se não houver documento
            setUserData({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
            });
          }
        } catch (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
          });
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Erro no login:', err);

      // Mensagens de erro amigáveis
      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado. Verifique o e-mail.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta. Tente novamente.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'E-mail ou senha incorretos.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Registro
  const register = async (
    email: string,
    password: string,
    userData: {
      name: string;
      cpfCnpj?: string;
      phone?: string;
      userType?: 'Vendedor' | 'Comprador';
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cria documento no Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: email,
        name: userData.name,
        cpfCnpj: userData.cpfCnpj || '',
        phone: userData.phone || '',
        userType: userData.userType || 'Comprador',
        avatar: '', // Usuário pode adicionar foto depois no perfil
        createdAt: new Date().toISOString(),
      });

      console.log('Usuário registrado com sucesso:', user.uid);
    } catch (err: any) {
      console.error('Erro no registro:', err);

      // Mensagens de erro amigáveis
      let errorMessage = 'Erro ao criar conta. Tente novamente.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso. Faça login ou use outro e-mail.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      setError('Erro ao sair. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil do usuário
  const updateUserProfile = async (updates: Partial<UserData>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      setLoading(true);
      setError(null);

      // Remove campos que não devem ser atualizados
      const { uid, email, ...allowedUpdates } = updates;

      // Atualiza no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, allowedUpdates);

      // Atualiza estado local
      setUserData((prev) => (prev ? { ...prev, ...allowedUpdates } : prev));

      console.log('Perfil atualizado com sucesso');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil. Tente novamente.');
      throw new Error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Upload de avatar (converte para base64 e salva no Firestore)
  const uploadAvatar = async (imageUri: string): Promise<string> => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      setLoading(true);
      setError(null);

      // Converte imagem para base64
      const base64Image = await uploadProfileImage(imageUri, user.uid, 2);

      // Atualiza avatar (base64) no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { avatar: base64Image });

      // Atualiza estado local
      setUserData((prev) => (prev ? { ...prev, avatar: base64Image } : prev));

      console.log('Avatar atualizado com sucesso (base64)');
      return base64Image;
    } catch (err: any) {
      console.error('Erro ao processar avatar:', err);
      setError('Erro ao processar a imagem. Tente novamente.');
      throw new Error(err.message || 'Erro ao processar a imagem');
    } finally {
      setLoading(false);
    }
  };

  // Enviar email de redefinição de senha
  const sendPasswordResetEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      await firebaseSendPasswordResetEmail(auth, email);
      console.log('Email de redefinição enviado para:', email);
    } catch (err: any) {
      console.error('Erro ao enviar email de redefinição:', err);

      let errorMessage = 'Erro ao enviar email de redefinição. Tente novamente.';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Recarregar dados do usuário
  const refreshUserData = async () => {
    try {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({
          uid: user.uid,
          email: user.email || '',
          ...data,
        });
      }
    } catch (err) {
      console.error('Erro ao recarregar dados do usuário:', err);
    }
  };

  const value: AuthContextData = {
    user,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    updateUserProfile,
    uploadAvatar,
    sendPasswordResetEmail,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
