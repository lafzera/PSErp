import { useState, useLayoutEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Link as ChakraLink,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  useToast,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiLogIn, FiInfo } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { api } from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canRender, setCanRender] = useState(false);
  const { signIn } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useLayoutEffect(() => {
    setCanRender(true);
  }, []);

  if (!canRender) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await signIn(data);
      
      if (success) {
        toast({
          title: 'Login realizado com sucesso',
          description: 'Redirecionando para o dashboard...',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout isPrivate={false}>
      <Container 
        maxW={{ base: "100%", sm: "md", md: "lg" }} 
        py={{ base: 4, sm: 6, md: 8 }}
        px={{ base: 4, sm: 6, md: 8 }}
      >
        <Box textAlign="center" mb={{ base: 4, sm: 6, md: 8 }}>
          <Heading 
            size={{ base: "md", sm: "lg", md: "xl" }} 
            color="white"
          >
            PhotoStudioERP by LaF
          </Heading>
          <Text 
            color="gray.400" 
            mt={2}
            fontSize={{ base: "xs", sm: "sm", md: "md" }}
          >
            Faça login para continuar
          </Text>
        </Box>
        
        <Card>
          <VStack 
            spacing={{ base: 3, sm: 4, md: 5 }} 
            p={{ base: 3, sm: 4, md: 5 }}
          >
            <Heading 
              size={{ base: "sm", sm: "md", md: "lg" }} 
              textAlign="center"
            >
              Entrar
            </Heading>
            
            {error && (
              <Alert status="error" borderRadius="md" width="100%" fontSize="sm">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={{ base: 2, sm: 3, md: 4 }}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize={{ base: "xs", sm: "sm", md: "md" }}>
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="seu@email.com"
                    size={{ base: "sm", sm: "md", md: "lg" }}
                    fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  />
                  {errors.email && (
                    <FormErrorMessage fontSize="xs">{errors.email.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontSize={{ base: "xs", sm: "sm", md: "md" }}>
                    Senha
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Digite sua senha"
                      size={{ base: "sm", sm: "md", md: "lg" }}
                      fontSize={{ base: "xs", sm: "sm", md: "md" }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size={{ base: "sm", sm: "md", md: "lg" }}
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && (
                    <FormErrorMessage fontSize="xs">{errors.password.message}</FormErrorMessage>
                  )}
                </FormControl>

                <Box w="100%" textAlign="right">
                  <Link href="/reset-password" passHref>
                    <ChakraLink 
                      color="blue.500" 
                      fontSize={{ base: "xs", sm: "sm", md: "md" }}
                    >
                      Esqueceu sua senha?
                    </ChakraLink>
                  </Link>
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size={{ base: "sm", sm: "md", md: "lg" }}
                  w="100%"
                  mt={2}
                  isLoading={isLoading}
                  loadingText="Entrando..."
                  leftIcon={<FiLogIn />}
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                >
                  Entrar
                </Button>
              </VStack>
            </form>
          </VStack>
        </Card>
      </Container>
    </Layout>
  );
} 