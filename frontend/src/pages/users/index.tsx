import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  useToast,
  HStack,
  Stack,
  Badge,
  Flex,
  Skeleton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { users as usersApi } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { UserForm } from '@/components/users/UserForm';
import { useRef } from 'react';
import { User } from '@/types';

export default function UsersPage() {
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const cancelRef = useRef(null);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'PHOTOGRAPHER' | 'ASSISTANT' | undefined>();

  // Carregar o usuário atual
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useQuery(
    'currentUser',
    usersApi.getCurrentUser,
    {
      onError: () => {
        router.push('/login');
      },
    }
  );

  // Set user role after initial render
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== 'ADMIN') {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar esta página.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/');
      } else {
        setCurrentUserRole(currentUser.role);
      }
    }
  }, [currentUser, router, toast]);

  // Carregar lista de usuários
  const { data: usersList, isLoading } = useQuery('users', usersApi.list, {
    enabled: !!currentUserRole && currentUserRole === 'ADMIN',
  });

  // Mutação para criar usuário
  const createUserMutation = useMutation(usersApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast({
        title: 'Usuário criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Mutação para atualizar usuário
  const updateUserMutation = useMutation(
    ({ id, data }: { id: string; data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }) => usersApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast({
          title: 'Usuário atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar usuário',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  // Mutação para excluir usuário
  const deleteUserMutation = useMutation(usersApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast({
        title: 'Usuário excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsConfirmDeleteOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  // Funções para manipulação
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    onOpen();
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleOpenDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      await deleteUserMutation.mutateAsync(selectedUser.id);
    }
  };

  const handleSubmitUser = async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data,
      });
    } else {
      await createUserMutation.mutateAsync(data);
    }
  };

  // Renderização dos skeletons durante o carregamento
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, index) => (
      <Tr key={`skeleton-${index}`}>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" width="80px" /></Td>
      </Tr>
    ));
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return <Badge colorScheme="red">Administrador</Badge>;
      case 'PHOTOGRAPHER':
        return <Badge colorScheme="green">Fotógrafo</Badge>;
      case 'ASSISTANT':
        return <Badge colorScheme="blue">Assistente</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Mostrar tela de carregamento enquanto verifica o acesso
  if (isLoadingCurrentUser || !currentUserRole) {
    return (
      <Layout userRole={undefined}>
        <Container maxW="container.xl" py={8}>
          <Card>
            <Box p={4} textAlign="center">
              <Text>Carregando...</Text>
            </Box>
          </Card>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout userRole={currentUserRole}>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg">Usuários</Heading>
              <Text color="gray.600" mt={1}>
                Gerencie os usuários do sistema
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleOpenCreateModal}
            >
              Novo Usuário
            </Button>
          </Flex>
        </Box>

        <Card>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Função</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  renderSkeletons()
                ) : (
                  usersList?.map((user: User) => (
                    <Tr key={user.id}>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
                      <Td>{getRoleBadge(user.role)}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Editar usuário"
                            icon={<FiEdit2 />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleOpenEditModal(user)}
                          />
                          <IconButton
                            aria-label="Excluir usuário"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleOpenDeleteConfirm(user)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </Container>

      <UserForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmitUser}
        initialData={selectedUser}
        isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}
      />

      <AlertDialog
        isOpen={isConfirmDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsConfirmDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Usuário
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsConfirmDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteUser}
                ml={3}
                isLoading={deleteUserMutation.isLoading}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Layout>
  );
} 