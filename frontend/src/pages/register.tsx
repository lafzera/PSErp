import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  async function handleRegister(data: RegisterFormData) {
    try {
      setIsLoading(true);
      await signUp(data.name, data.email, data.password);
      toast({
        title: 'Conta criada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro ao criar sua conta. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout isPrivate={false}>
      <Container maxW="container.sm" py={16}>
        <Stack spacing={8} align="center">
          <Box textAlign="center" mb={8}>
            <Heading size="xl" color="white">PhotoStudioERP by LaF</Heading>
            <Text color="gray.400" mt={2}>Crie sua conta</Text>
          </Box>

          <Card w="100%" maxW="400px">
            <Stack spacing={6} p={6}>
              <Box textAlign="center">
                <Heading size="lg" color="white">Criar Conta</Heading>
                <Text mt={2} color="whiteAlpha.800">
                  Preencha os dados abaixo para criar sua conta
                </Text>
              </Box>

              <form onSubmit={handleSubmit(handleRegister)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.name}>
                    <FormLabel>Nome</FormLabel>
                    <Input
                      placeholder="Seu nome"
                      bg="gray.800"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ 
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                      }}
                      _placeholder={{ color: 'whiteAlpha.400' }}
                      {...register('name')}
                    />
                    {errors.name && (
                      <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      bg="gray.800"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ 
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                      }}
                      _placeholder={{ color: 'whiteAlpha.400' }}
                      {...register('email')}
                    />
                    {errors.email && (
                      <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Senha</FormLabel>
                    <Input
                      type="password"
                      placeholder="******"
                      bg="gray.800"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ 
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                      }}
                      _placeholder={{ color: 'whiteAlpha.400' }}
                      {...register('password')}
                    />
                    {errors.password && (
                      <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <Input
                      type="password"
                      placeholder="******"
                      bg="gray.800"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ 
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                      }}
                      _placeholder={{ color: 'whiteAlpha.400' }}
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    isLoading={isLoading}
                    _hover={{ bg: 'blue.600' }}
                    _active={{ bg: 'blue.700' }}
                  >
                    Criar Conta
                  </Button>
                </Stack>
              </form>

              <Text textAlign="center" color="whiteAlpha.900">
                Já tem uma conta?{' '}
                <Link href="/login" passHref>
                  <ChakraLink color="blue.400" _hover={{ color: 'blue.300' }}>
                    Faça login
                  </ChakraLink>
                </Link>
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
} 