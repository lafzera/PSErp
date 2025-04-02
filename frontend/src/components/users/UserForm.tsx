import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { User } from '@/types';

// Schema de validação para o formulário
const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'PHOTOGRAPHER', 'ASSISTANT'], {
    errorMap: () => ({ message: 'Função é obrigatória' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Schema para edição (sem senha obrigatória)
const editUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(['ADMIN', 'PHOTOGRAPHER', 'ASSISTANT'], {
    errorMap: () => ({ message: 'Função é obrigatória' }),
  }),
}).refine((data) => !data.password || !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData: User | null;
  isLoading: boolean;
}

export function UserForm({ isOpen, onClose, onSubmit, initialData, isLoading }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isEditMode = !!initialData;

  // Usar o schema correto com base no modo (criação ou edição)
  const schema = isEditMode ? editUserSchema : createUserSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          password: '',
          confirmPassword: '',
        }
      : {
          name: '',
          email: '',
          role: 'ASSISTANT',
          password: '',
          confirmPassword: '',
        },
  });

  const handleFormSubmit = (data: z.infer<typeof schema>) => {
    const formData = { ...data };
    
    // Remover confirmPassword do envio
    delete formData.confirmPassword;
    
    // Remover password se vazio na edição
    if (isEditMode && !formData.password) {
      delete formData.password;
    }
    
    onSubmit(formData);
  };

  // Reset form quando o modal é fechado
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Nome</FormLabel>
                <Input {...register('name')} placeholder="Nome completo" />
                {errors.name && (
                  <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input {...register('email')} type="email" placeholder="email@exemplo.com" />
                {errors.email && (
                  <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.role}>
                <FormLabel>Função</FormLabel>
                <Select {...register('role')}>
                  <option value="ADMIN">Administrador</option>
                  <option value="PHOTOGRAPHER">Fotógrafo</option>
                  <option value="ASSISTANT">Assistente</option>
                </Select>
                {errors.role && (
                  <FormErrorMessage>{errors.role.message}</FormErrorMessage>
                )}
              </FormControl>

              <Divider />
              
              {isEditMode && (
                <Alert status="info" borderRadius="md" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Deixe os campos de senha em branco para manter a senha atual.
                  </Text>
                </Alert>
              )}

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>{isEditMode ? 'Nova Senha' : 'Senha'}</FormLabel>
                <InputGroup>
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isEditMode ? 'Nova senha (opcional)' : 'Senha'}
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
                {errors.password && (
                  <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirmar Senha</FormLabel>
                <InputGroup>
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={isEditMode ? 'Confirmar nova senha' : 'Confirmar senha'}
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
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
              loadingText={isEditMode ? 'Salvando' : 'Criando'}
            >
              {isEditMode ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 