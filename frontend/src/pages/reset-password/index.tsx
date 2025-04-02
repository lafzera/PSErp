import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormErrorMessage,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { users } from '@/services/api';

// Schema para validação do email
const resetPasswordSchema = z.object({
  email: z.string().email('Digite um email válido'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await users.resetPassword(data.email);
      
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro ao solicitar a redefinição de senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>Redefinir Senha</Heading>
          <Text color="gray.600">
            Informe seu email para receber um link de redefinição de senha
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
              Solicitação enviada com sucesso!
            </AlertTitle>
            <AlertDescription maxWidth="md">
              Enviamos um email com instruções para redefinir sua senha.
              Por favor, verifique sua caixa de entrada.
            </AlertDescription>
            <Box mt={6}>
              <Link href="/login" passHref>
                <Button as="a" leftIcon={<FiArrowLeft />} variant="outline">
                  Voltar para o Login
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

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Seu email de cadastro"
                  {...register('email')}
                />
                {errors.email && (
                  <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                )}
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Enviando..."
                w="100%"
              >
                Enviar Link de Redefinição
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
    </Container>
  );
} 