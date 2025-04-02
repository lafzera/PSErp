import { createContext, useContext, useState, useLayoutEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import { api, auth, users } from '../services/api';
import type { User } from '../services/api';

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => false,
  signOut: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Função para carregar usuário atual
  const loadUser = async () => {
    try {
      console.log('Attempting to load user data...');
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? 'Token exists' : 'No token found');
      
      const userData = await users.getCurrentUser();
      console.log('User data loaded successfully:', userData);
      setUser(userData);
      return userData;
    } catch (error: any) {
      console.error("Detailed error in loadUser:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      localStorage.removeItem('token');
      setUser(null);
      return null;
    }
  };

  useLayoutEffect(() => {
    setIsClient(true);
    async function loadUserFromStorage() {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          await loadUser();
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  const signIn = async ({ email, password }: SignInCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Iniciando processo de login...');
      
      const response = await auth.login({ email, password });
      console.log('Resposta do login:', response);
      
      localStorage.setItem('token', response.token);
      console.log('Token salvo no localStorage');
      
      console.log('Carregando dados do usuário...');
      const userResponse = await users.getCurrentUser();
      console.log('Dados do usuário carregados:', userResponse);
      setUser(userResponse);
      
      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/dashboard');
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error);
      let errorMessage = 'Ocorreu um erro ao fazer login';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro ao fazer login',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  function signOut() {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  }

  useLayoutEffect(() => {
    if (!isLoading && isClient) {
      const publicPages = ['/login', '/reset-password', '/reset-password/confirm'];
      const isPublicPage = publicPages.some(page => 
        router.pathname === page || 
        router.pathname.startsWith(`${page}/`)
      );
      
      if (!isPublicPage && !user) {
        router.push('/login');
      }
    }
  }, [isLoading, user, router, router.pathname, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 