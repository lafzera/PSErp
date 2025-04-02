import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Avatar,
  Center,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCamera } from 'react-icons/fi';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast({
          title: 'Erro',
          description: 'As senhas não coincidem',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await api.put('/users/profile', {
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      updateUser(response.data);
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await api.put('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(response.data);
      
      toast({
        title: 'Sucesso',
        description: 'Foto de perfil atualizada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Erro ao atualizar foto de perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Layout>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="lg" color="white">Meu Perfil</Heading>
          
          <Box bg="gray.800" p={6} rounded="lg" shadow="lg">
            <Center mb={6}>
              <Box position="relative">
                <Avatar
                  size="2xl"
                  name={user?.name}
                  src={user?.avatar}
                  bg="blue.500"
                  color="white"
                />
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar">
                  <IconButton
                    aria-label="Alterar foto"
                    icon={<FiCamera />}
                    size="sm"
                    position="absolute"
                    bottom={0}
                    right={0}
                    colorScheme="blue"
                    rounded="full"
                    cursor="pointer"
                  />
                </label>
              </Box>
            </Center>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel color="white">Nome</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">E-mail</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Senha Atual</FormLabel>
                  <Input
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Nova Senha</FormLabel>
                  <Input
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Confirmar Nova Senha</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                    _hover={{ borderColor: 'gray.500' }}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isLoading}
                >
                  Salvar Alterações
                </Button>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Layout>
  );
} 