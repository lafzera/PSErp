import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormErrorMessage,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FiArrowLeft, FiEye, FiEyeOff, FiKey } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { users } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';

// Schema para validação de nova senha
const confirmResetSchema = z.object({
  newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ConfirmResetFormData = z.infer<typeof confirmResetSchema>;

export default function ConfirmResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmResetFormData>({
    resolver: zodResolver(confirmResetSchema),
  });

  // Verificar se o token é válido
  useEffect(() => {
    if (token) {
      // Em uma implementação real, você pode verificar a validade do token
      // fazendo uma chamada para o backend
      setIsValidToken(true);
    }
  }, [token]);

  const onSubmit = async (data: ConfirmResetFormData) => {
    if (!token) {
      setError('Token de redefinição inválido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await users.confirmResetPassword({
        token: token as string,
        newPassword: data.newPassword,
      });
      
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao redefinir sua senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout isPrivate={false}>
      <Container maxW="md" py={12}>
        <Card>
          {isValidToken === false ? (
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              py={6}
            >
              <AlertIcon boxSize={8} mr={0} mb={4} />
              <AlertTitle fontSize="lg" mb={2}>
                Link inválido ou expirado
              </AlertTitle>
              <AlertDescription maxWidth="md">
                O link de redefinição de senha é inválido ou expirou.
                Por favor, solicite um novo link.
              </AlertDescription>
              <Box mt={6}>
                <Link href="/reset-password" passHref>
                  <Button as="a" colorScheme="blue" variant="outline">
                    Solicitar novo link
                  </Button>
                </Link>
              </Box>
            </Alert>
          ) : (
            <VStack spacing={8} align="stretch" p={6}>
              <Box textAlign="center">
                <Heading size="xl" mb={2}>Nova Senha</Heading>
                <Text color="gray.400">
                  Crie uma nova senha para sua conta
                </Text>
              </Box>

              {isSuccess ? (
                <Alert
                  status="success"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  borderRadius="md"
                  py={6}
                >
                  <AlertIcon boxSize={8} mr={0} mb={4} />
                  <AlertTitle fontSize="lg" mb={2}>
                    Senha alterada com sucesso!
                  </AlertTitle>
                  <AlertDescription maxWidth="md">
                    Sua senha foi redefinida. Agora você pode fazer login com sua nova senha.
                  </AlertDescription>
                  <Box mt={6}>
                    <Link href="/login" passHref>
                      <Button as="a" colorScheme="blue">
                        Ir para o Login
                      </Button>
                    </Link>
                  </Box>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={6} align="stretch">
                    {error && (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <FormControl isInvalid={!!errors.newPassword}>
                      <FormLabel>Nova Senha</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua nova senha"
                          {...register('newPassword')}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      {errors.newPassword && (
                        <FormErrorMessage>{errors.newPassword.message}</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl isInvalid={!!errors.confirmPassword}>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <InputGroup>
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirme sua nova senha"
                          {...register('confirmPassword')}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                      {errors.confirmPassword && (
                        <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
                      )}
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isLoading={isSubmitting}
                      loadingText="Redefinindo..."
                      w="100%"
                      leftIcon={<FiKey />}
                    >
                      Redefinir Senha
                    </Button>

                    <Box textAlign="center">
                      <Link href="/login" passHref>
                        <ChakraLink color="blue.500">
                          Voltar para o Login
                        </ChakraLink>
                      </Link>
                    </Box>
                  </VStack>
                </form>
              )}
            </VStack>
          )}
        </Card>
      </Container>
    </Layout>
  );
} 