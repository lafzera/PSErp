import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  Badge,
  useDisclosure,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from '@chakra-ui/react';
import { 
  FiMoreVertical, 
  FiPlus, 
  FiEdit2, 
  FiTrash2,
  FiBox,
  FiCheckCircle,
  FiAlertTriangle,
  FiTool
} from 'react-icons/fi';
import { Layout } from '@/components/Layout';
import { Equipment, inventory } from '@/services/api';
import { useQuery, useQueryClient } from 'react-query';
import { EquipmentModal } from '@/components/EquipmentModal';

function StatCard({ 
  label, 
  value, 
  total,
  icon: Icon,
  type = 'default'
}: { 
  label: string; 
  value: number; 
  total: number;
  icon: React.ElementType;
  type?: 'success' | 'warning' | 'danger' | 'default';
}) {
  const colorScheme = {
    success: 'green',
    warning: 'orange',
    danger: 'red',
    default: 'blue',
  }[type];

  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <Card bg="gray.800" borderColor="gray.700">
      <CardBody>
        <Stat>
          <HStack spacing={2} mb={2}>
            <Icon size={20} color={`${colorScheme}.400`} />
            <StatLabel color="gray.300">{label}</StatLabel>
          </HStack>
          <StatNumber color="white" fontSize="2xl">
            {value}
          </StatNumber>
          <Progress
            value={percentage}
            colorScheme={colorScheme}
            size="sm"
            mt={2}
            rounded="full"
          />
        </Stat>
      </CardBody>
    </Card>
  );
}

const categoryLabels = {
  CAMERA: 'Câmera',
  LENS: 'Lente',
  LIGHTING: 'Iluminação',
  SUPPORT: 'Suporte',
  ACCESSORY: 'Acessório',
};

const statusColors = {
  AVAILABLE: 'green',
  IN_USE: 'blue',
  MAINTENANCE: 'orange',
  LOW_STOCK: 'red',
};

const statusLabels = {
  AVAILABLE: 'Disponível',
  IN_USE: 'Em Uso',
  MAINTENANCE: 'Em Manutenção',
  LOW_STOCK: 'Estoque Baixo',
};

export default function Inventory() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>();
  const queryClient = useQueryClient();

  const { data: equipments = [], isLoading } = useQuery(
    'equipments',
    inventory.listEquipments
  );

  const { data: stats } = useQuery(
    'inventory-stats',
    inventory.getInventoryStats,
    {
      initialData: {
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        lowStock: 0,
      }
    }
  );

  const handleNewEquipment = () => {
    setSelectedEquipment(undefined);
    onOpen();
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    onOpen();
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await inventory.deleteEquipment(id);
      queryClient.invalidateQueries('equipments');
      queryClient.invalidateQueries('inventory-stats');
      toast({
        title: 'Equipamento excluído',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir equipamento',
        description: 'Tente novamente mais tarde',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Layout>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Box>
            <HStack justify="space-between" align="center">
              <Box>
                <Heading size="lg" color="white">Estoque</Heading>
                <Text color="gray.400" mt={1}>
                  Gerencie seus equipamentos
                </Text>
              </Box>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={handleNewEquipment}
                _hover={{ bg: 'blue.500' }}
                _active={{ bg: 'blue.600' }}
              >
                Novo Equipamento
              </Button>
            </HStack>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <StatCard
              label="Total de Itens"
              value={stats.total}
              total={stats.total}
              icon={FiBox}
            />
            <StatCard
              label="Disponíveis"
              value={stats.available}
              total={stats.total}
              icon={FiCheckCircle}
              type="success"
            />
            <StatCard
              label="Em Uso"
              value={stats.inUse}
              total={stats.total}
              icon={FiBox}
              type="warning"
            />
            <StatCard
              label="Em Manutenção"
              value={stats.maintenance}
              total={stats.total}
              icon={FiTool}
              type="danger"
            />
          </SimpleGrid>

          <Box
            bg="gray.800"
            rounded="lg"
            shadow="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Categoria</Th>
                  <Th>Quantidade</Th>
                  <Th>Status</Th>
                  <Th>Localização</Th>
                  <Th width="50px"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {equipments.map((equipment) => (
                  <Tr key={equipment.id}>
                    <Td>
                      <Text fontWeight="medium" color="white">
                        {equipment.name}
                      </Text>
                      {equipment.brand && (
                        <Text fontSize="sm" color="gray.400">
                          {equipment.brand} {equipment.model}
                        </Text>
                      )}
                    </Td>
                    <Td>{categoryLabels[equipment.category]}</Td>
                    <Td>
                      <HStack>
                        <Text>{equipment.quantity}</Text>
                        {equipment.quantity <= equipment.minQuantity && (
                          <Badge colorScheme="red">Baixo</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={statusColors[equipment.status]}
                        px={2}
                        py={1}
                        rounded="full"
                      >
                        {statusLabels[equipment.status]}
                      </Badge>
                    </Td>
                    <Td>{equipment.location || '-'}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList bg="gray.800" borderColor="gray.700">
                          <MenuItem
                            icon={<FiEdit2 />}
                            onClick={() => handleEditEquipment(equipment)}
                            _hover={{ bg: 'whiteAlpha.200' }}
                            _focus={{ bg: 'whiteAlpha.200' }}
                          >
                            Editar
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            onClick={() => handleDeleteEquipment(equipment.id)}
                            color="red.400"
                            _hover={{ bg: 'whiteAlpha.200' }}
                            _focus={{ bg: 'whiteAlpha.200' }}
                          >
                            Excluir
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Container>

      <EquipmentModal
        isOpen={isOpen}
        onClose={onClose}
        equipment={selectedEquipment}
      />
    </Layout>
  );
} 