import { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Flex,
  Text,
  Badge,
  useToast,
  Skeleton,
  useDisclosure,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  HStack,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiSearch, FiUser, FiPhone, FiMail, FiTag } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { clients, Client } from '@/services/api';
import { ClientModal } from './ClientModal';

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isLoading, data: clientsList } = useQuery('clients', clients.list);

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

  function handleOpenModal(client: Client) {
    setSelectedClient(client);
    onOpen();
  }

  async function handleDelete(id: string) {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteMutation.mutateAsync(id);
    }
  }

  async function handleSubmit(data: Partial<Client>) {
    try {
      if (selectedClient) {
        await clients.update(selectedClient.id, data);
        queryClient.invalidateQueries('clients');
        toast({
          title: 'Cliente atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar cliente',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const filteredClients = clientsList?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.code.includes(searchTerm)
  );

  function handleClientClick(client: Client) {
    router.push(`/clients/${client.id}`);
  }

  function renderSkeleton() {
    return Array(5).fill(0).map((_, i) => (
      <Tr key={i}>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="20px" width="80px" /></Td>
      </Tr>
    ));
  }

  return (
    <>
      <Stack spacing={4} mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            <FiSearch color='gray.300' />
          </InputLeftElement>
          <Input 
            placeholder='Buscar clientes...' 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Stack>

      <Box overflowX="auto" borderWidth="1px" borderRadius="lg" shadow="sm">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th><HStack><FiTag size={14} /><Text ml={1}>Código</Text></HStack></Th>
              <Th><HStack><FiUser size={14} /><Text ml={1}>Nome</Text></HStack></Th>
              <Th><HStack><FiMail size={14} /><Text ml={1}>Email</Text></HStack></Th>
              <Th><HStack><FiPhone size={14} /><Text ml={1}>Telefone</Text></HStack></Th>
              <Th>Tipo</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              renderSkeleton()
            ) : filteredClients && filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <Tr 
                  key={client.id} 
                  _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  onClick={() => handleClientClick(client)}
                >
                  <Td>{client.code}</Td>
                  <Td>{client.name}</Td>
                  <Td>{client.email}</Td>
                  <Td>{client.phone}</Td>
                  <Td>
                    <Badge colorScheme="blue">{client.type.name}</Badge>
                  </Td>
                  <Td>
                    <Flex gap={2} onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        aria-label="Editar cliente"
                        icon={<FiEdit2 />}
                        size="sm"
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(client);
                        }}
                      />
                      <IconButton
                        aria-label="Excluir cliente"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
                        }}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center" py={4}>
                  Nenhum cliente encontrado
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {selectedClient && (
        <ClientModal
          isOpen={isOpen}
          onClose={onClose}
          client={selectedClient}
          onSave={handleSubmit}
        />
      )}
    </>
  );
} 