import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

// Schema de validação para o formulário de senha
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'A senha atual deve ter pelo menos 6 caracteres'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  isLoading: boolean;
}

export function PasswordForm({ onSubmit, isLoading }: PasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleFormSubmit = (data: PasswordFormData) => {
    onSubmit({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    
    // Resetar o formulário após o envio bem-sucedido
    if (isSubmitSuccessful) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={6} align="stretch">
        <Text>
          Altere sua senha regularmente para manter sua conta segura. Use uma combinação
          de letras, números e caracteres especiais.
        </Text>

        <FormControl isInvalid={!!errors.currentPassword}>
          <FormLabel>Senha Atual</FormLabel>
          <InputGroup>
            <Input
              {...register('currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Digite sua senha atual"
            />
            <InputRightElement>
              <IconButton
                aria-label={showCurrentPassword ? 'Ocultar senha' : 'Mostrar senha'}
                icon={showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                variant="ghost"
                size="sm"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            </InputRightElement>
          </InputGroup>
          {errors.currentPassword && (
            <FormErrorMessage>{errors.currentPassword.message}</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.newPassword}>
          <FormLabel>Nova Senha</FormLabel>
          <InputGroup>
            <Input
              {...register('newPassword')}
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Digite a nova senha"
            />
            <InputRightElement>
              <IconButton
                aria-label={showNewPassword ? 'Ocultar senha' : 'Mostrar senha'}
                icon={showNewPassword ? <FiEyeOff /> : <FiEye />}
                variant="ghost"
                size="sm"
                onClick={() => setShowNewPassword(!showNewPassword)}
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
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme a nova senha"
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

        <Box>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<FiSave />}
            isLoading={isLoading}
            loadingText="Alterando..."
          >
            Alterar Senha
          </Button>
        </Box>
      </VStack>
    </form>
  );
} 