import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { users } from '@/services/api';
import { useQueryClient } from 'react-query';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'PHOTOGRAPHER', 'ASSISTANT'], {
    errorMap: () => ({ message: 'Função inválida' }),
  }),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Validar confirmação de senha apenas para novos usuários
  if (!data.password && !data.confirmPassword) return true;
  return data.password === data.confirmPassword;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => {
  // Senha é obrigatória para novos usuários
  if (!data.password && !data.confirmPassword) return true;
  return data.password && data.confirmPassword;
}, {
  message: "Senha é obrigatória para novos usuários",
  path: ["password"],
});

type UserFormData = z.infer<typeof userSchema>;

const roleOptions = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'PHOTOGRAPHER', label: 'Fotógrafo' },
  { value: 'ASSISTANT', label: 'Assistente' },
];

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      role: user.role,
    } : {
      role: 'ASSISTANT', // Valor padrão para novos usuários
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        await users.update(user.id, {
          name: data.name,
          email: data.email,
          role: data.role,
        });
      } else {
        if (!data.password) {
          toast({
            title: 'Erro',
            description: 'A senha é obrigatória para novos usuários.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        await users.create({
          name: data.name,
          email: data.email,
          role: data.role,
          password: data.password,
        });
      }
      
      queryClient.invalidateQueries('users');
      toast({
        title: user ? 'Usuário atualizado' : 'Usuário criado',
        description: `O usuário ${data.name} foi ${user ? 'atualizado' : 'criado'} com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o usuário.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md"
      isCentered
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent 
        bg="gray.800" 
        borderColor="gray.700"
        borderWidth="1px"
        boxShadow="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader color="white" borderBottomWidth="1px" borderColor="gray.700">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel color="white">Nome</FormLabel>
                <Input
                  {...register('name')}
                  placeholder="Nome do usuário"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ 
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                  }}
                  _placeholder={{ color: 'gray.400' }}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel color="white">E-mail</FormLabel>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="email@exemplo.com"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ 
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                  }}
                  _placeholder={{ color: 'gray.400' }}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.role}>
                <FormLabel color="white">Função</FormLabel>
                <Select
                  {...register('role')}
                  placeholder="Selecione uma função"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _hover={{ borderColor: 'gray.500' }}
                  _focus={{ 
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                  }}
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
              </FormControl>

              {!user && (
                <>
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel color="white">Senha</FormLabel>
                    <Input
                      {...register('password')}
                      type="password"
                      placeholder="******"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ 
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                      }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel color="white">Confirmar Senha</FormLabel>
                    <Input
                      {...register('confirmPassword')}
                      type="password"
                      placeholder="******"
                      bg="gray.700"
                      borderColor="gray.600"
                      color="white"
                      _hover={{ borderColor: 'gray.500' }}
                      _focus={{ 
                        borderColor: 'blue.400',
                        boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                      }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                  </FormControl>
                </>
              )}
            </Stack>
          </ModalBody>

          <ModalFooter 
            borderTopWidth="1px" 
            borderColor="gray.700"
          >
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              _active={{ bg: 'whiteAlpha.300' }}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              _hover={{ bg: 'blue.500' }}
              _active={{ bg: 'blue.600' }}
            >
              {user ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 