import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  IconButton,
  useDisclosure,
  useToast,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { clients } from '@/services/api';
import { Layout } from '@/components/Layout';
import { ClientList } from '@/components/ClientList';
import { ClientModal } from '@/components/ClientModal';
import type { Client } from '@/types/client';

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { isLoading, data: clientsList } = useQuery('clients', clients.list);

  const createMutation = useMutation(clients.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients');
      toast({
        title: 'Cliente criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Erro ao criar cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const updateMutation = useMutation(
    (data: { id: string; data: Partial<Client> }) =>
      clients.update(data.id, data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        toast({
          title: 'Cliente atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
      },
      onError: () => {
        toast({
          title: 'Erro ao atualizar cliente',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const deleteMutation = useMutation(clients.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients');
      toast({
        title: 'Cliente excluído',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  function handleOpenModal(client?: Client) {
    if (client) {
      setSelectedClient(client);
    } else {
      setSelectedClient(null);
    }
    onOpen();
  }

  async function handleSubmit(data: Partial<Client>) {
    if (selectedClient) {
      await updateMutation.mutateAsync({ id: selectedClient.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <HStack justify="space-between">
            <Heading size="lg">Clientes</Heading>
            <Button
              leftIcon={<Icon as={FiPlus} />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Novo Cliente
            </Button>
          </HStack>
        </Box>

        <ClientList />

        <ClientModal
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleSubmit}
          initialData={selectedClient}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      </Container>
    </Layout>
  );
} 