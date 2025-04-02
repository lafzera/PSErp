import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { api } from '@/services/api';
import { SystemConfig } from '@/services/api';

export function SystemConfigComponent() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await api.system.listConfigs();
      setConfigs(response.data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar configurações',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedConfig) {
        await api.system.updateConfig(selectedConfig.key, formData);
        toast({
          title: 'Configuração atualizada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.system.createConfig(formData);
        toast({
          title: 'Configuração criada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      loadConfigs();
    } catch (error) {
      toast({
        title: 'Erro ao salvar configuração',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (config: SystemConfig) => {
    setSelectedConfig(config);
    setFormData({
      key: config.key,
      value: config.value,
      description: config.description || '',
    });
    onOpen();
  };

  const handleDelete = async (key: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta configuração?')) {
      try {
        await api.system.deleteConfig(key);
        toast({
          title: 'Configuração excluída com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        loadConfigs();
      } catch (error) {
        toast({
          title: 'Erro ao excluir configuração',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleNew = () => {
    setSelectedConfig(null);
    setFormData({
      key: '',
      value: '',
      description: '',
    });
    onOpen();
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Configurações do Sistema
        </Text>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleNew}
        >
          Nova Configuração
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Chave</Th>
            <Th>Valor</Th>
            <Th>Descrição</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {configs.map((config) => (
            <Tr key={config.id}>
              <Td>{config.key}</Td>
              <Td>{config.value}</Td>
              <Td>{config.description}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Editar"
                    icon={<FiEdit2 />}
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleEdit(config)}
                  />
                  <IconButton
                    aria-label="Excluir"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(config.key)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedConfig ? 'Editar Configuração' : 'Nova Configuração'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Chave</FormLabel>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="Digite a chave"
                    isDisabled={!!selectedConfig}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Valor</FormLabel>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="Digite o valor"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Descrição</FormLabel>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Digite a descrição"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={isLoading}
                >
                  {selectedConfig ? 'Atualizar' : 'Criar'}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 